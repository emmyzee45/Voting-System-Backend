import { User } from "../../entity/User";
import fs from "fs";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { rekognition } from "../../../utils/providers";

export const loginWithFace = async(req, res) => {
    const image = req.file;
    let user = null;
    const rekognitionParams = {
        CollectionId: process.env.REKOGNITION_COLLECTION_ID,
        Image: {
            Bytes: fs.readFileSync(image.path)
        }
    };

    rekognition.searchFacesByImage(rekognitionParams, async(err, data) => {
        if (err) return res.status(500).send(err);

        if (data.FaceMatches.length === 0) return res.status(401).send({ message: 'Face not recognized' });

        const faceId = data.FaceMatches[0].Face.FaceId;

  try {
    user = await User.findOneOrFail({ where: { faceId }});
  } catch (error) {
    return res.status(404).send(error);
  }
  if (!user.verified) return res.status(400).send("Not verified");

  const match = await bcrypt.compare(req.body.password, user.password);
  //exits if password doesn't match
  if (!match) return res.status(400).send("password doesn't match");

  // if the code reaches here then the user is authenticated
  // hurray :D

  const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;
  const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET;

  if (!accessTokenSecret || !refreshTokenSecret) {
   
    return res.status(500).send("server error");
  }

  const plainUserObject = {
    id: user.id,
    name: user.name,
    citizenshipNumber: user.citizenshipNumber,
    email: user.email,
    admin: user.admin,
  };
  const accessToken = jwt.sign(plainUserObject, accessTokenSecret, {
    expiresIn: 60,
  });
  const refreshToken = jwt.sign(plainUserObject, refreshTokenSecret, {
    expiresIn: "7d",
  });

  res.cookie("refreshToken", refreshToken, {
    expires: dayjs().add(7, "days").toDate(),
  });

  return res.send({ user, accessToken });
        // const sql = 'SELECT * FROM users WHERE face_id = ?';
        // db.query(sql, [faceId], (err, results) => {
        //     if (err) return res.status(500).send(err);
        //     if (results.length === 0) return res.status(404).send({ message: 'User not found' });

        //     const user = results[0];
        //     const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        //     res.send({ token });
        // });
    });
};
// app.post('/login-face', upload.single('image'), (req, res) => {
//     const image = req.file;

//     const rekognitionParams = {
//         CollectionId: process.env.REKOGNITION_COLLECTION_ID,
//         Image: {
//             Bytes: fs.readFileSync(image.path)
//         }
//     };

//     rekognition.searchFacesByImage(rekognitionParams, (err, data) => {
//         if (err) return res.status(500).send(err);

//         if (data.FaceMatches.length === 0) return res.status(401).send({ message: 'Face not recognized' });

//         const faceId = data.FaceMatches[0].Face.FaceId;

//         const sql = 'SELECT * FROM users WHERE face_id = ?';
//         db.query(sql, [faceId], (err, results) => {
//             if (err) return res.status(500).send(err);
//             if (results.length === 0) return res.status(404).send({ message: 'User not found' });

//             const user = results[0];
//             const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
//             res.send({ token });
//         });
//     });
// });
