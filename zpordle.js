function norm_power(n, p) {
  // returns power of p found in n
  if (n == 0) {
    // hopefully shouldnt get here
    return -1;
  }
  var k = 0;
  while (n % p == 0) {
    n = n / p;
    k++;
  }
  return k;
}

function sample_from_distribution(dist) {
  // should probably test this
  var tot = 0;
  for (var p in dist) {
    tot += dist[p];
  }
  var r = tot * Math.random();
  var sum = 0;
  for (var p in dist) {
    sum += dist[p];
    if (sum >= r) {
      return parseInt(p);
    }
  }
}

function guess_helper(g) {
  var li = document.createElement("li");
  var val = 0;
  var pow = -1;
  if (g != target) {
    pow = norm_power(Math.abs(g - target), todays_primes[guesses]);
    if (pow == 0) {
      val = 1;
    } else {
      val = "1/" + Math.pow(todays_primes[guesses], pow);
    }
  }
  li.innerHTML = "Prime: " + todays_primes[guesses] + " Guess: " + g + " Norm: " + val;
  li.style.backgroundColor = get_color(pow);
  share_emojis.push(pow);
  document.getElementById("guesses").appendChild(li);
  guesses++;
  if (val != 0 && guesses != NUM_GUESSES) {
    document.getElementById("curguess").innerHTML = "Current Prime: " + todays_primes[guesses];
    return;
  }
  won = (val == 0);

  // update statistics
  if (localStorage.getItem("last-played-date") != today) {
    // update guess statistics
    var statistics = JSON.parse(localStorage.getItem("statistics"));
    statistics[won ? guesses : 0]++;
    localStorage.setItem("statistics", JSON.stringify(statistics));
    // update streak statistics
    var streaks = JSON.parse(localStorage.getItem("streaks"));
    if (won) {
      streaks["current-streak"]++;
      streaks["max-streak"] = Math.max(streaks["current-streak"], streaks["max-streak"]);
    } else {
      streaks["current-streak"] = 0;
    }
    localStorage.setItem("streaks", JSON.stringify(streaks));
    //
    localStorage.setItem("last-played-date", today)
  }

  // Game is over (either guess was correct, or we're out of guesses).
  var result_string = val == 0 ?
    "You win!" :
    "You lose. Today's number was " + target + ".";
  document.getElementById("button").disabled = true;
  document.getElementById("curguess").innerHTML = "";

	displayStats(result_string, /* includeShare= */true);
}

function stats() {
	displayStats("", false);
}

function displayStats(result_string, includeShare) {
  result_string += "<canvas id=\"stats\" style=\"height: 300px; width: 100%;\"></canvas>";
  result_string += "<div id=\"streak\" style=\"display: flex;\"></div>";
  if (includeShare) {
    result_string += "<br/>" + SHARE_BUTTON;
  }
  document.getElementById("result").innerHTML = result_string;

  var statistics = JSON.parse( localStorage.getItem( "statistics" ) );
  var streaks = JSON.parse( localStorage.getItem( "streaks" ) );
  var games_played = statistics.reduce( ( a , b ) => a + b )
  var wins = statistics.slice( 1 ).reduce( ( a , b ) => a + b )
  var winpercent = ( games_played == 0 ) ? "N/A" : Math.floor( 100 * wins / games_played ) + "%" ;
  var streak_string = "";
  streak_string += "<div id=\"played\" style=\"flex: 1;\">Played<div style=\"font-size: 2em\">" + games_played + "</div></div>";
  streak_string += "<div id=\"winpercent\" style=\"flex: 1\">Win Percentage<div style=\"font-size: 2em\">" + winpercent + "</div></div>";
  streak_string += "<div id=\"curstreak\" style=\"flex: 1\">Current Streak<div style=\"font-size: 2em\">" + streaks[ "current-streak" ] + "</div></div>";
  streak_string += "<div id=\"maxstreak\" style=\"flex: 1\">Max Streak<div style=\"font-size: 2em\">" + streaks[ "current-streak" ] + "</div></div>";
  document.getElementById("streak").innerHTML = streak_string;

	loadStats();
  $('#result').modal('show');
}

function loadStats() {
  var statistics = JSON.parse(localStorage.getItem("statistics"));
  //
  const labels = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  const data = {
    labels: labels,
    datasets: [{
      barPercentage: .9,
      minBarLength: 20,
      data: statistics.slice(1)
    }]
  };
  Chart.register(ChartDataLabels);
  const config = {
    plugins: [ChartDataLabels],
    type: 'bar',
    data: data,
    options: {
      indexAxis: "y",
      scales: {
        x: {
          display: false
        }
      },
      plugins: {
        legend: {
          display: false
        },

        title: {
          text: "Guess Distribution",
          display: true
        },
        tooltip: {
          enabled: false
        },
        datalabels: {
          anchor: "end",
          align: "left",
          // only display label if > 0
          display: function(context) {
            var index = context.dataIndex;
            var value = context.dataset.data[index];
            return value > 0;
          }
        }
      },
    }
  };

  const myChart = new Chart(document.getElementById("stats"), config);
}

function loadStreak() {
  var elt = document.getElementById("streak");
  var streaks = JSON.parse(localStorage.getItem("streaks"));
  var streak_string = "This will hopefully look better soon.<br>";
  streak_string += "Streak: " + JSON.stringify(streaks);
  elt.innerHTML = streak_string;
}

function guess() {
  var g = document.getElementById("guess-input").value;
  document.getElementById("guess-input").value = "";
  try {
    g = parseInt(g);
	if ( g < 0 || g > MAX_NUM ) { throw err; }
  } catch (err) {
    alert("Not a valid guess.");
	return;
  }
  guess_helper(g);
  var arr = JSON.parse(localStorage.todays_guesses);
  arr.push(g);
  localStorage.todays_guesses = JSON.stringify(arr);
}

function share() {
  // need to make the display date a separate variable because 'today' is used for seeding the random number generation.
  var today_but_not_weird = (nd.getMonth() + 1) + '/' + nd.getDate() + '/' + nd.getFullYear();
  var text = "Zpordle " + today_but_not_weird + " " + (won ? guesses : "X") + "/" + NUM_GUESSES + "\n";
  var emojis = "";
  for (var i = 0; i < share_emojis.length; i++) {
    emojis += emoji_lookup(share_emojis[i]);
    if ((i % 5 == 4) && (i != share_emojis.length - 1)) {
      emojis += "\n";
    }
  }
  text += (emojis + "\n");
  text += "https://mabotkin.github.io/zpordle"
  navigator.clipboard.writeText(text).then(function() {
    alert("Copied to clipboard.");
  }, function() {
    alert("Failed to copy. So go do your manifolds you nerd.")
  });
}

function get_color(pow) {
  switch (pow) {
    case -1:
      return '#57b5ff';
    case 0:
      return '#ff0000';
    case 1:
      return '#ff8000';
    case 2:
      return '#ffff00';
    default:
      return '#80ff00';
  }
}

function color_scale(percent) {
  var r = Math.round(Math.min((1 - percent) * 512, 255));
  var g = Math.round(Math.min(percent * 512, 255));
  var b = 0;
  var h = r * 0x10000 + g * 0x100 + b * 0x1;
  return '#' + ('000000' + h.toString(16)).slice(-6);
}

function emoji_lookup(val) {
  if (val in EMOJI_TABLE) {
    return EMOJI_TABLE[val];
  }
  return EMOJI_TABLE[3];
}

// constants
var MAX_NUM = 1000;
var NUM_PRIMES = 10;
var NUM_GUESSES = 10;
//
document.getElementById("max-guess").innerHTML = MAX_NUM;
document.getElementById("num-guesses").innerHTML = NUM_GUESSES;
//
var PRIMES = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97, 101, 103, 107, 109, 113, 127, 131, 137, 139, 149, 151, 157, 163, 167, 173, 179, 181, 191, 193, 197, 199, 211, 223, 227];
var MY_PRIMES = PRIMES.slice(0, NUM_PRIMES);
var DISTRIBUTION = {}
for (var i = 0; i < MY_PRIMES.length; i++) {
  var p = MY_PRIMES[i];
  DISTRIBUTION[p] = 1.0 / p;
}
//
var EMOJI_TABLE = {
  "-1": String.fromCodePoint(0x2611),
  "0": String.fromCodePoint(0x1F7E5),
  "1": String.fromCodePoint(0x1F7E7),
  "2": String.fromCodePoint(0x1F7E8),
  "3": String.fromCodePoint(0x1F7E9),
}
var SHARE_BUTTON = "<button id=\"share\" type=\"button\" onclick=\"share()\">Share</button>";

// always use pacific time
var d = new Date();
var utc = d.getTime() + (d.getTimezoneOffset() * 60000);
var nd = new Date(utc + (3600000 * '-8'));
var today = nd.getFullYear() + '/' + (nd.getMonth() + 1) + '/' + nd.getDate();

// using https://github.com/davidbau/seedrandom
Math.seedrandom(today);

var target = Math.round(Math.random() * MAX_NUM);
var todays_primes = []
var guesses = 0;
var won = false;
var share_emojis = [];

for (var i = 0; i < NUM_GUESSES; i++) {
  todays_primes.push(sample_from_distribution(DISTRIBUTION));
}
todays_primes.sort(function(a, b) {
  return a - b;
});

document.getElementById("info").innerHTML = "Today's Primes: " + todays_primes.join(", ");
document.getElementById("curguess").innerHTML = "Current Prime: " + todays_primes[0];

// initialize statistics/streaks if we haven't yet
if (localStorage.getItem("statistics") === null) {
  localStorage.setItem("statistics", JSON.stringify(new Array(11).fill(0)));
}
if (localStorage.getItem("streaks") === null) {
  localStorage.setItem("streaks", JSON.stringify({
    "current-streak": 0,
    "max-streak": 0
  }));
}

// check local storage for todays guesses
if (localStorage.getItem("date") != today) {
  localStorage.date = today;
  localStorage.todays_guesses = "[]";
} else {
  var arr = JSON.parse(localStorage.todays_guesses);
  for (var i = 0; i < arr.length; i++) {
    guess_helper(arr[i]);
  }
}
// check if we missed a day
var streaks = JSON.parse(localStorage.getItem("streaks"));
try {
  var last_played = localStorage.getItem("last-played-date");
  if (Date.parse(today) - Date.parse(last_played) > 86400000) {
    streaks["current-streak"] = 0;
  }
} catch {
  // if last-date-played does not exist
  streaks["current-streak"] = 0;
}
localStorage.setItem("streaks", JSON.stringify(streaks));
// Shamelessly stolen from w3schools like a proper programmer.
var input = document.getElementById("guess-input");
input.addEventListener("keyup", function(event) {
  if (event.keyCode === 13) {
    event.preventDefault();
    document.getElementById("button").click();
  }
});
