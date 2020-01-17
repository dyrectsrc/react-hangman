var words = 
[
    "react",
    "programming",
    "project",
    "tesla",
    "robotics"
]

function randomWord(){
    return words[Math.floor(Math.random() * words.length)]
}

export {randomWord};