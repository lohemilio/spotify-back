//'AQCLrChFfNQV4R91qjfJz4TF6ULYeZj9iStUFO6MUXiODM1XyHSmIybpUxI_A7gHS8quItb35Z6KLEVuT7S-SR6jABE8fNiLLtjSYmuXBQNX92nfBVjeLS26fa2yN7xl5Ta3XMlZRU_w5kWDIoBVvswi4b6FvkXiVIaFZMWyW-3HQdA1yarmpRYzOaGD_bwcezAAgeYaRdDYZ4uaot4ba0pFpHpxpza_5EGkN-ENhxvj1ELcaB5QY4-Z8veNsQD7gqXre1k'
const express = require('express')
const request = require ('request')
const app = express()
const port = process.env.PORT || 3000
const Artists = require('./models/artists.js')
var cors = require('cors');

app.use(cors())
//const Base64 = require('js-base64').Base64

const client_id = "f3ba57facce840b0b65f67329f047281"


const redirect_uri = 'https://spotify-back-project.herokuapp.com/redirect'
const scope = 'playlist-read-private playlist-modify-public playlist-modify-private'
//const credentials = require('./credentials.js')
//"Luis Miguel", "The Strokes", "Bad bunny","Queen"
var artistList = []
var totalTop = []

app.get('/spotify',function(req,res){
    const authorize_url = 'https://accounts.spotify.com/authorize?' + 'client_id=' + client_id + '&response_type=code&redirect_uri=' + redirect_uri + '&scope=' + scope
    //console.log(authorize_url)
    var artists = req.query.artists
    encodedArtists = decodeURI(artists)
    var splitedArtists = artists.split(",")
    splitedArtists.forEach(function(artName){
        artistList.push(artName)
    })
    res.redirect(authorize_url)
})




app.get('/redirect',function(req,res){
    console.log(artistList)
    //var auth = credentials.CLIENT_ID + ':' + credentials.CLIENT_SECRET
    var auth_encoded = "ZjNiYTU3ZmFjY2U4NDBiMGI2NWY2NzMyOWYwNDcyODE6Nzc1ODYyYzllYjNlNGY5MTk2MTdkODIxYTkxMTNmNDM="
   //console.log(auth)
    //console.log(auth_encoded)
    const options = {
        url : 'https://accounts.spotify.com/api/token',
        form: {
            code : req.query.code,
            redirect_uri: redirect_uri,
            grant_type: 'authorization_code'
        },
        headers: {
            'Authorization' : 'Basic ' + auth_encoded
        },
        json: true
    }
    
    request.post(options,function(error,response){
        //console.log("RESULTADO DEL API TOKEN:")
        //console.log(response.body)
        bodyToken = response.body.access_token
        token = 'Bearer ' + bodyToken
        console.log("TOKEN: " + token)
        
        userUrl = "https://api.spotify.com/v1/me"
        request({url: userUrl, json:true, headers:{"Authorization": token}},function(err,res){
            user_id = res.body.id
            console.log("USER ID: " + user_id)
            artistList.forEach(function(artistName){
                var encodedArtist = encodeURI(artistName)
                console.log(encodedArtist)
                const artistUrl = "https://api.spotify.com/v1/search?q="+encodedArtist+"&type=artist"
                request({url: artistUrl, json:true, headers:{"Authorization": token}},function(err,res){
                    var body = res.body
                    console.log(body)
                    aName= body.artists.items[0].name
                    aId = body.artists.items[0].id

                    console.log("Artista: " + aName)
                    console.log("ID" + aId)
                    var topUrl = "https://api.spotify.com/v1/artists/"+aId+"/top-tracks?country=MX"
                    request({url:topUrl,json:true,headers:{"Authorization": token}},function(err,res){
                        
                         top1 = res.body.tracks[0].id
                         top2 = res.body.tracks[1].id
                         top3 = res.body.tracks[2].id
                         top4 = res.body.tracks[3].id
                         top5 = res.body.tracks[4].id
                         totalTop.push(top1,top2,top3,top4,top5)
                         if (totalTop.length == (artistList.length*5)){
                             console.log("lista completa:")
                             console.log(totalTop)
                             uriList = []
                             totalTop.forEach(function(trackId){
                                uriname = ("spotify:track:"+trackId)
                                uriList.push(uriname)
                             })
                             console.log(uriList)
                             //stotalTop = JSON.stringify(totalTop)
                             playlistUrl = "https://api.spotify.com/v1/users/"+user_id+"/playlists"
                             request({method: 'POST',url:playlistUrl,json:true,headers:{"Authorization": token, "Content-Type":"application/json"},body:{
                                 name : "WEB PLAYLIST",
                                 public : true,
                             }},function(err,res){
                                playlistId = res.body.id
                                tracksUrl = "https://api.spotify.com/v1/playlists/"+playlistId+"/tracks"
            
                                request({method: 'POST',url:tracksUrl,json:true,headers:{"Authorization": token, "Content-Type":"application/json"},body:{
                                    uris: uriList
                                }},function(err,res){
                                    console.log(res.body)
                                    
                                })
                             })
                         }
                    })
                }) 
            })
        })
    })
    return res.send("<h1>TU PLAYLIST HA SIDO CREADA EXITOSAMENTE, REVISA TU CUENTA")
})

app.get('*', function(req, res) {
    res.send({
      How_to_use: 'This route does not exist, try /spotify?artists=YOUR FAVORITE ARTISTS SEPARATED BY COMMA TO CREATE A PLAYLIST WITH THEM IN SPOTIFY'
    })
  })

app.listen(port,function(){
    console.log('Up in port: ' + port)
})