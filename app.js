const express = require('express');
const axios = require('axios');
const redis = require('redis');
 
const app = express();

// HTTP HEADER TECHNIQUE SIMPLE EXAMPLE
app.use(express.static('public', {
    etag: true, 
    lastModified: true,
    setHeaders: (res, path) => {
    //   uncomment —— comment out different chunks and check result in devTools

    //   example of cache control dependant on the path  
    //   if (path.endsWith('.html')) {
    //     res.setHeader('Cache-Control', 'no-cache');
    //   } 

    // res.setHeader('Cache-Control', 'no-store'); // any caching is blocked

    res.setHeader('Cache-Control', 'no-cache'); // caching with validation is enabled
    },
  }));
 
// WITHOUT REDIS CACHE
app.get('/without/:img', async (req, res) => { 
    const response = await axios.get("https://clipart.info/images/ccovers/1520611249hd-Grass-PNG-Transparent-Image.png", {                
        responseType: 'arraybuffer'
    });

    const buffer = await Buffer.from(response.data, 'binary');
    const url = 'data:image/png;base64,' + buffer.toString('base64');

    return res.status(200).send({data: url});
})

// SERVER SIDE CACHING
const server = redis.createClient(6379); // type here the port redis in running on if it is different from the default

app.get('/redis/:img', (req, res) => {

 try {

   const item = req.params.img;

   server.get(item, async (err, url) => {
     if (url) {
       console.log("Found in cache")

       return res.status(200).send({data: url})
     } else {
        console.log("Not found in cache")
        
        //get the image as a buffer
        const response = await axios.get("https://clipart.info/images/ccovers/1520611249hd-Grass-PNG-Transparent-Image.png", {                
            responseType: 'arraybuffer'
        });

        //convert back to base64 url
        const buffer = await Buffer.from(response.data, 'binary');
        const url = 'data:image/png;base64,' + buffer.toString('base64');
        
        //in-memory write the image url to redis
        //.setex(key, expires, value)
        server.setex(item, 3600, url);
 
        return res.status(200).send({data: url});
     }
   }) 
 } catch (error) {
     console.log(error)
 }
});
 
app.listen(3000, () => {
 console.log(`Server running on port 3000`);
});
 
 
module.exports = app;