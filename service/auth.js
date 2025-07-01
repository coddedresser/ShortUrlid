const jwt=require('jsonwebtoken');
const SECRETKEY="jdnvklwnligvnelbm"
function setUser(user){
    return jwt.sign({
        _id:user._id,
        email:user.email,
    },SECRETKEY); 
}

function getUser(token){
    if(!token) return null;
    return jwt.verify(token,SECRETKEY);
}

module.exports={
    setUser,getUser
}