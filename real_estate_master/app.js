//importing modules
var express = require( 'express' );
var request = require( 'request' );
var cheerio = require( 'cheerio' );

//creating a new express server
var app = express();

//setting EJS as the templating engine
app.set( 'view engine', 'ejs' );

//setting the 'assets' directory as our static assets dir (css, js, img, etc...)
app.use( '/assets', express.static( 'assets' ) );



function getMAEstimation( lbcData, routeResponse){
    if ( lbcData.city)
        && lbcData.postalCode
        && lbcData.surface
        && lbcData.price){
        const url = 'https://www.meilleursagents.com/prix-immobilier/(city)-(postalCode)/'.replace('city)',lbcData.city.replace(/\_/g, '-'))
        .replace('(postalCode)' lbcData.postalCode );

console.log('NA URL:', url)
/*
request(url, function (error, response, html){
    if( !error){
        let $ = cheerio( html);
        
        
       if( ma)
    }
})*/
        }
};

function parseLBCData( html ){
    const $ = cheerio.load(html)
    const lbcDataArray = $('section.properties span.value' )
    
    return lbcData = {
        price: parseInt( $( lbcDataArray.get( 0 )))
                .text().replace(/\s/g,''),10),
        city: $(lbcDataArray.get(1))
                .text().trim().toLowerCase()
                .replace( /\_|\s\g/, '-' ).replace(/\-\d+/,''),
        postalCode: $(lbcDataArray.get(1))
                .text().trim().toLowerCase().replace(/\D|\-/g,''),
        type: $(lbcDataArray.get(2))
                .text().trim().toLowerCase(),
        surface: parseInt( $( lbcDataArray.get( 4 ))
                .text().replace(/\s/g,''),10)
    }
};

function getLBCDATA( lbcUrl, routeResponse, callback){
    request( lbcUrl, function(error,response, html){
        if(!error){
            let $ =cheerio.load(html);//module pour parser le document html
            
            const lbcData = parseLBCData( html )
            if( lbcData) {
                console.log('LBC Data',lbcData )//affiche dans la console
                callback( lbcData, routeResponse )
            }else{
              routeResponse.render('pages/index',{
                  error: 'No data found'
              });  
                
            }
        }else{
              routeResponse.render('pages/index',{
                  error: 'No data found'
              });
        }

   });
}
//makes the server respond to the '/' route and serving the 'home.ejs' template in the 'views' directory
app.get( '/process', function ( req, res ) {
    const url = req.query.lbcUrl;
    //req:requete res:reponse
    if(url){
        getLBCDATA(url, res, getMAEstimation)
    }else{
        res.render('pages/index',{//on a un repertoire page avec un fichier index.html
            error: 'Url is empty'
        });
    }
    
});


//launch the server on the 3000 port
app.listen( 3000, function () {
    console.log( 'App listening on port 3000!' );
});

function isGoodDeal( lbcData, maData){
    const adPricePerSqM = Math.round( lbcData.price / lbcData.surface )
    const maPrice = lbcData.type === 
   'appartement' ? maData.priceAppart : maData.priceHouse
   return adPricePerSqM
    
}