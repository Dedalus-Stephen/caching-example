async function setImage(){
    // const response = await fetch("http://localhost:3000/without/grass");
    const response = await fetch("http://localhost:3000/redis/grass");
    const res = await response.json();
    document.getElementById("img").setAttribute("src", res.data);
}

setImage();