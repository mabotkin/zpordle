function norm_power( n , p ) {
	// returns power of p found in n
	if ( n == 0 ) {
		// hopefully shouldnt get here
		return -1;
	}
	var k = 0;
	while ( n % p == 0 ) {
		n = n / p;
		k++;
	}
	return k;
}

function sample_from_distribution( dist ) {
	// should probably test this
	var tot = 0;
	for ( var p in dist ) {
		tot += dist[ p ];
	}
	var r = tot * Math.random();
	var sum = 0;
	for ( var p in dist ) {
		sum += dist[ p ];
		if ( sum >= r ) {
			return parseInt( p );
		}
	}
}

function guess_helper( g ) {
	var li = document.createElement("li");
	var val = 0;
	var pow = 0;
	if ( g != target ) {
		pow = norm_power( Math.abs( g - target ) , todays_primes[ guesses ] );
		if ( pow == 0 ) {
			val = 1;
		} else {
			val = "1/" + Math.pow( todays_primes[ guesses ] , pow );
		}
	}
	li.innerHTML = "Prime: " + todays_primes[ guesses ] + " Guess: " + g + " Norm: " + val;
	li.style.backgroundColor = color_scale( Math.min( 1 , pow / 4.0 ) );
	document.getElementById( "guesses" ).appendChild( li );
	if ( val == 0 ) {
		won = true;
		document.getElementById( "result" ).innerHTML = "You win!";
		document.getElementById( "share" ).style.display = "";
		document.getElementById( "button" ).disabled = true;
	}
	guesses++;
	if ( guesses == NUM_GUESSES ) {
		document.getElementById( "result" ).innerHTML = "You lose.  Today's number was " + target;
		document.getElementById( "share" ).style.display = "";
		document.getElementById( "button" ).disabled = true;
	} else {
		document.getElementById( "curguess" ).innerHTML = "Current Prime: " + todays_primes[ guesses ];
	}
}

function guess() {
	var g = document.getElementById("guess-input").value;
	document.getElementById("guess-input").value = "";
	try {
		g = parseInt( g );
	} catch ( err ) {
		alert( "Not a valid guess." );
	}
	guess_helper( g );
	var arr = JSON.parse( localStorage.todays_guesses );
	arr.push( g );
	localStorage.todays_guesses = JSON.stringify( arr );
}

function share() {
	var text = "Zpordle " + today + " " + ( won ? guesses : "X" ) + "/" + NUM_GUESSES + "\n";
	text += "https://mabotkin.github.io/zpordle"
	navigator.clipboard.writeText( text );
	alert( "Copied to clipboard." );
}

function color_scale( percent ) {
	var r = Math.min( ( 1 - percent ) * 512 , 255 );
	var g = Math.min( percent * 512 , 255 );
	var b = 0;
	var h = r * 0x10000 + g * 0x100 + b * 0x1;
	return '#' + ('000000' + h.toString(16)).slice(-6);
}

// constants
var MAX_NUM = 1000;
var NUM_PRIMES = 25;
var NUM_GUESSES = 10;
//
var PRIMES = [2,3,5,7,11,13,17,19,23,29,31,37,41];
var MY_PRIMES = PRIMES.slice( 0 , NUM_PRIMES );
var DISTRIBUTION = {}
for ( var i = 0 ; i < MY_PRIMES.length ; i++ ) {
	var p = MY_PRIMES[ i ];
	DISTRIBUTION[ p ] = 1.0/p;
}

// always use pacific time
var d = new Date();
var utc = d.getTime() + (d.getTimezoneOffset() * 60000);
var nd = new Date(utc + (3600000*'-8'));
var today = nd.getFullYear()+'/'+(nd.getMonth()+1)+'/'+nd.getDate();

// using https://github.com/davidbau/seedrandom
Math.seedrandom( today );

var target = Math.round( Math.random() * MAX_NUM );
var todays_primes = []
var guesses = 0;
var won = false;
for ( var i = 0 ; i < NUM_GUESSES ; i++ ) {
	todays_primes.push( sample_from_distribution( DISTRIBUTION ) );
}
todays_primes.sort(function(a, b) { return a - b; });

document.getElementById( "info" ).innerHTML = "Today's Primes: " + todays_primes;
document.getElementById( "curguess" ).innerHTML = "Current Prime: " + todays_primes[0];

// check local storage for todays guesses
if ( localStorage.getItem( "date" ) != today ) {
	localStorage.date = today;
	localStorage.todays_guesses = "[]";
} else {
	var arr = JSON.parse( localStorage.todays_guesses );
	for ( var i = 0 ; i < arr.length ; i++ ) {
		guess_helper( arr[ i ] );
	}
}

// Shamelessly stolen from w3schools like a proper programmer.
var input = document.getElementById("guess-input");
input.addEventListener("keyup", function(event) {
	if (event.keyCode === 13) {
   event.preventDefault();
   document.getElementById("button").click();
  }
});
