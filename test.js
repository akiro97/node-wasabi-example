const express = require('express')
const multer  = require('multer')
const upload = multer({ dest: 'public/uploads/' })

const app = express();
const port = 4002

app.post('/test/baseEncode/file-upload', upload.single('example'), (req, res, next) => {
  // req.file is the `example` file or whatever you have on the `name` attribute: <input type="file" name="example" />
  // I believe it is a `Buffer` object.
  const encoded = req.file.buffer.toString('base64')
  console.log(encoded)
});

app.listen(port, () => {
    console.log(`Test Server is live on http://localhost:${port}`);
})