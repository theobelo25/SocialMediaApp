import axios from 'axios';

const uploadPic = async (media) => {
    try {
        const form = newFormData();
        form.append('file', media);
        form.append('upload_preset', 'social_media');
        form.append('cloud_name', 'tb25smappproject');

        const res = await axios.post(process.env.CLOUDINARY_URL, form);
        return res.data.url;

    } catch (error) {
        return;
    }
};

export default uploadPic;