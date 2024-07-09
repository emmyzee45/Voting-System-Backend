import { rekognition, s3 } from "../../../utils/providers";
import { User } from "../../entity/User";
import fs from "fs";
import bcrypt from "bcrypt";

export const registerWithFAce = async (req, res) => {
    const { name, password, citizenshipNumber, email } = req.body;
    const image = req.body.file;
    console.log(name, password, citizenshipNumber, email)

    if (!image) {
        return res.status(400).send({ message: 'Image is required' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Upload image to S3
    const s3Params = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: `${Date.now()}_${image.originalname}`,
        Body: fs.createReadStream(image.path)
    };

    s3.upload(s3Params, async (err, data) => {
        if (err) return res.status(500).send(err);

        const imageUrl = data.Location;

        // Index the face using Rekognition
        const rekognitionParams = {
            CollectionId: process.env.REKOGNITION_COLLECTION_ID,
            Image: {
                S3Object: {
                    Bucket: process.env.S3_BUCKET_NAME,
                    Name: imageUrl
                }
            }
        };

        rekognition.indexFaces(rekognitionParams, async(err, rekognitionData) => {
            if (err) return res.status(500).send(err);

            const faceId = rekognitionData.FaceRecords[0].Face.FaceId;

            
            const newUser = new User();

            newUser.admin = false;
            newUser.name = name;
            newUser.email = email;
            newUser.image_url = imageUrl;
            newUser.faceId = faceId;
            newUser.password = hashedPassword;
            newUser.citizenshipNumber = citizenshipNumber;

            try {
                await User.save(newUser);
            } catch (error) {
                return res.status(400).send(error);
            }

            return res.send(newUser);
            // // Store user in database
            // const sql = 'INSERT INTO users (username, password, image_url, face_id) VALUES (?, ?, ?, ?)';
            // db.query(sql, [username, hashedPassword, imageUrl, faceId], (err, result) => {
            //     if (err) return res.status(500).send(err);
            //     res.status(201).send({ message: 'User registered successfully!' });
            // });
        });
    });
};
