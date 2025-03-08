const express = require('express');
const uuid = require('uuid');
const app = express();
const port = 8080;

//class used for creation of ads
class Ad {
    constructor(id, title, description, cost, photo) {
      this.id = id;
      this.title = title;
      this.description = description;
      this.cost = cost;
      this.photo = photo;
    }
}

// DAO for handling favorite ads
class FavoriteAds {
    constructor() {
        this.allFavoriteAds = [];
    }
  
    //get favorite ads for a user
    getFavoriteAds(userId) {
        const userFavoriteAds = this.allFavoriteAds.find(entry => entry.userId === userId);
        return userFavoriteAds ? userFavoriteAds.ads : [];
    }
  
    //add an ad to a user's favorites
    addFavoriteAd(userId, ad) {
        let userFavoriteAds = this.allFavoriteAds.find(entry => entry.userId === userId);
        
        //first time user adds an ad to his favourites
        if (!userFavoriteAds) {
          userFavoriteAds = { userId, ads: [] };
          this.allFavoriteAds.push(userFavoriteAds);
        }
        
        //check if the ad already exists
        if (!userFavoriteAds.ads.some(favAd => favAd.id === ad.id)) {
          userFavoriteAds.ads.push(ad);
          return true;
        }
        return false;
      }
}


const favoriteAds = new FavoriteAds();

app.listen(port, () => {
    console.log(`Η υπηρεσία ιστού εκτελείται στη θύρα ${port}`);
});


/* 
    Serve static content from directory "public",
    it will be accessible under path /, 
    e.g. http://localhost:8080/index.html
*/
app.use(express.static('public'))

// parse url-encoded content from body
app.use(express.urlencoded({ extended: false }))

// parse application/json content from body
app.use(express.json())

// serve index.html as content root
app.get('/', function(req, res){
    var options = {
        root: path.join(__dirname, 'public')
    }

    res.sendFile('index.html', options, function(err){
        console.log(err)
    })
})

//4 default usernames and passwords
const users = [
    { username: 'user1', password: 'password1', id:1 },
    { username: 'user2', password: 'password2', id:2 },
    { username: 'user3', password: 'password3', id:3 },
    { username: 'user4', password: 'password4', id:4 },
];

let user_sessId = [];//here session_ids for users are stored

//function to find usernames in the lists
function findInList(name,list){
    const found = list.find(obj => obj.username === name);
    return found;
}

//function to validate passwords and session_ids
function validate(user,attr,str){
    if (str=='pass'){
        if (user && attr==user.password){
            return true;
        }
    }else if (str=='sess'){
        if (user && attr==user.session_Id){
            return true;
        }
    }
    return false;
}

//serve login request
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    // Find the user by username
    const user = findInList(username,users);

    //validate username and password
    if (validate(user,password,'pass')) {
        const sessionId = uuid.v4();//create the sessionId
        const user1 = findInList(username,user_sessId);
        if (!user1){//first login
            user_sessId.push({username:user.username,session_Id:sessionId});
        }else {//not first
            user1.session_Id = sessionId;
        }
        res.status(200).json({ sessionId });//successful login
    } else {
        res.status(401).json({ error: 'Ανεπιτυχής ταυτοποίηση. Ελέγξτε τα στοιχεία σας.' });//unaccepted username and password
    }  
});

//serve addFavourite request
app.post('/addFavourite', (req, res) => {
    const {ad_id,title,descr,cost,photo_url,username,session_Id} = req.body;

    //find user
    const user = findInList(username,user_sessId);
    const user1 = findInList(username,users); 

    //validate session_id
    if (validate(user,session_Id,'sess')){
        const f_ad = new Ad(ad_id,title,descr,cost,photo_url);//create ad
        const stored = favoriteAds.addFavoriteAd(user1.id,f_ad);//store the ad
        if (!stored){
            res.status(409);//already exists
        }else{
            res.status(200);//stored correctly
        }
    }else{
        res.status(401).json({ error: 'Ανεπιτυχής ταυτοποίηση.'});//unaccepted username and session_id
    }
});


//serve useFavourites request
app.get('/userFavourites', (req, res) => {
    const {lUsername,lSessionId} = req.query;

    //find user
    const user = findInList(lUsername,user_sessId); 
    const user1 = findInList(lUsername,users); 

    //validate session_id
    if (validate(user,lSessionId,'sess')){
        const userFavoriteAds = favoriteAds.getFavoriteAds(user1.id);
        res.status(200).json(userFavoriteAds);//successful request
    }else{
        res.status(401).json({ error: 'Ανεπιτυχής ταυτοποίηση.'});//unaccepted username and session_id
    }
});