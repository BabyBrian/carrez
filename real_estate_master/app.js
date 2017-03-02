//importing modules
var express = require( 'express' );
var request = require( 'request' );
var cheerio = require( 'cheerio' );
//creating a new express server
var app = express();
var message;
//setting EJS as the templating engine
app.set( 'view engine', 'ejs' );

//setting the 'assets' directory as our static assets dir (css, js, img, etc...)
//app.use( '/assets', express.static( 'assets' ) );
app.use(express.static(__dirname + '/public'));

app.get('/',function(req,res){
    res.render('pages/index');
});
app.get( '/process', function ( req, res ){
    const url = req.query.lbcUrl;
    if(url){
        getLBCDATA(url, res, getMAEstimation)
    }else{
        res.render('pages/index',{
            error: 'Url is empty'
        });
    }
});

function parseMaData (html) {
	
	const priceAppartRegex = /\bappartement\b : (\d+) €/mi
	const priceHouseRegex = /\bmaison\b : (\d+) €/mi
	
	if(html)
	{
		const priceAppart = priceAppartRegex.exec( html ) && priceAppartRegex.exec( html ).length === 2 ? priceAppartRegex.exec( html )[1] :0
		const priceHouse = priceHouseRegex.exec( html ) && priceHouseRegex.exec( html ).length === 2 ? priceHouseRegex.exec( html )[1] :0
		if (priceAppart && priceHouse){
			return maData = {
				priceAppart,
				priceHouse
			}
		}
	}
	
}

function getMAEstimation(lbcData, routeResponse)
{
	if( lbcData.city && lbcData.postalCode && lbcData.surface && lbcData.price)
	{
		const url='https://www.meilleursagents.com/prix-immobilier/{city}-{postalCode}/'.replace('{city}',lbcData.city.replace(/\_/g,'-') ).replace( '{postalCode}', lbcData.postalCode);
		//console.log('MA URL: ',url)
		request( url, function(error,response, html){
				if(!error){
				 let $ = cheerio.load(html);			
					if($ ('meta[name=description]').get().length === 1 && $( 'meta[name=description]').get()[0].attribs && $('meta[name=description]').get()[0].attribs.content)
				 
				 var maData=parseMaData(html)
				//selection du type
				if(lbcData.type==='appartement'){
					var ref = maData.priceAppart;
				}else{
					var ref = maData.priceHouse;
				}
				//console.log('MA tar:', maData)
				//console.log('MA ref:', ref)
					if(maData.priceAppart && maData.priceHouse)
					{
						//message=0;
						message = isGoodDeal(lbcData,ref);
						
						routeResponse.render('pages/index', 
						{
							message,lbcData,ref
								
						})
						console.log('conclusion: ',message)
					}
				}else{
					console.log('erreur lors du scrapping de MA')
				}
			}//module pour parser le doc html (parser=analyser)}
		       )
	}
}

function parseLBCData( html ){
    const $ = cheerio.load(html)
    const lbcDataArray = $('section.properties span.value' )
	const lbcDataArray2 = $('section.properties span.property' )
	var type;
	var surf;
    //tri ici pour type et surface
	for ( var i = 0; i < $ ( lbcDataArray2).length ; i++){
			if($( lbcDataArray2.get( i )).text()==='Type de bien'){
				type = $( lbcDataArray.get( i )).text()
			}
			if($( lbcDataArray2.get( i )).text()==='Surface'){
				surf = $( lbcDataArray.get( i )).text()
			}
		}
    return lbcData = {
        price: parseInt( $( lbcDataArray.get( 0 )).text().replace(/\s/g,''),10),
        city: $(lbcDataArray.get(1)).text().trim().toLowerCase().replace( /\_|\s/g, '-' ).replace(/\-\d+/,''),
        postalCode: $(lbcDataArray.get(1)).text().trim().toLowerCase().replace(/\D|\-/g,''),
        type: type.trim().toLowerCase(),
        surface: parseInt( surf.replace(/\s/g,''),10)
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

function isGoodDeal( lbcData, maData){
    const adPricePerSqM = Math.round( lbcData.price / lbcData.surface )//prix lbc
	var conclu;
	if(maData>adPricePerSqM){
		conclu="C'est une bonne affaire car le prix est " + Math.sign((adPricePerSqM-maData)/maData) + "% en dessous du marché"
	}else{
		conclu="Ce n'est pas une bonne affaire car le prix est " + (adPricePerSqM-maData)/maData + "% trop élevé"
	}
   
   return conclu    
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