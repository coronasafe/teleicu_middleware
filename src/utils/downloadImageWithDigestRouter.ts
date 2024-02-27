import Axios from "axios";
import fs from "fs";

export const downloadImage = async (
  url: string,
  filepath: string,
  username: string,
  password: string,
) => {
  const response = await Axios({
    url,
    method: "GET",
    responseType: "stream",
    auth: {
      username,
      password,
    },
  });

  return new Promise((resolve, reject) => {
    response.data
      .pipe(fs.createWriteStream(filepath))
      .on("error", reject)
      .once("close", () => resolve(filepath));
  });
};
