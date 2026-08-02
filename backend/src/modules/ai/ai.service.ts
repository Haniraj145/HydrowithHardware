import axios from "axios";
import FormData from "form-data";
import fs from "fs";

class AIService {

    async predict(imagePath: string) {

        const form = new FormData();

        form.append(
            "file",
            fs.createReadStream(imagePath)
        );

        const response = await axios.post(
            process.env.ML_SERVICE_URL || "http://127.0.0.1:8001/predict",
            form,
            {
                headers: form.getHeaders()
            }
        );

        return response.data;
    }
}

export default new AIService();