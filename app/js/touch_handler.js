/**
 * Created by zackaman on 7/15/14.
 */

var theTouch = new Array(); //0 = touch start X, 1 = touch start Y, 2 = touch current X, 3 = touch current Y
var radius = 100;
var search_open = false;


function startup() {
    var el = document.getElementById("maincontent");
    el.addEventListener("touchstart", handleStart, false);
    el.addEventListener("touchend", handleEnd, false);
//        el.addEventListener("touchcancel", handleCancel, false);
//        el.addEventListener("touchleave", handleEnd, false);
    el.addEventListener("touchmove", handleMove, false);

    //card initialization
    document.getElementById("card0").style.opacity = 1;

    console.log("initialized.");
}

function handleStart(e) {
//    event.preventDefault();
//        console.log("touchstart");
//        console.log("(" + e.touches[0].clientX + ", " + e.touches[0].clientY + ")");
    theTouch[0] = e.touches[0].clientX;
    theTouch[1] = e.touches[0].clientY;
}


//return true/false if distance > R and within the arc, as well as which quadrant the event triggered
//return which quadrant should be triggered (or maybe trigger directly)
function handleEnd(e) {
//    event.preventDefault();
//        console.log("touchend");
//        console.log(theTouch[2] + ", "+theTouch[3]);
    var dist_obj = calculate_distance();

    //execute function
    if (dist_obj[2] == true) { //over threshold
        switch (dist_obj[1]) {
            case 0: //like
                if(search_open == true){
                    toggle_search(-1);
                }
                swipe_up_complete();
                break;
            case 1: //previous card
                change_card(-1);
                break;
            case 2: //toggle searchbar
                toggle_search(1);
                break;
            case 3: //next card
                change_card(1);
                break;
            default:
                break;
        }
    }


    resetIndicators(-1);
}

//returns dist_obj array, [0] = distance, [1] = quadrant, [2] = true if over radius threshold
function calculate_distance() {
    var overR = false;
    var distance = Math.sqrt(Math.pow(theTouch[2] - theTouch[0], 2) + Math.pow(theTouch[3] - theTouch[1], 2));
    var adjacent = theTouch[2] - theTouch[0];
    var opposite = theTouch[3] - theTouch[1];
    var degrees = (180 / Math.PI) * Math.atan2(opposite, adjacent);
    if (degrees < 0) {
        degrees += 360;
    }

    var quadrant = -1;
    if (degrees > 225 && degrees <= 315) {
        quadrant = 0;
    }
    if (degrees > 315 || degrees <= 45) {
        quadrant = 1;
    }
    if (degrees > 45 && degrees <= 135) {
        quadrant = 2;
    }
    if (degrees > 135 && degrees <= 225) {
        quadrant = 3;
    }

    if (distance > radius) {
        overR = true;
    }

//        console.log(distance);
//        console.log(degrees + " degrees");
//        console.log(quadrant);

    var dist_obj = new Array();
    dist_obj[0] = distance;
    dist_obj[1] = quadrant;
    dist_obj[2] = overR;

    return dist_obj;
}


function resetIndicators(quadrant) {
    if (quadrant != 0) {
        like.style.opacity = "0";
        like.style.top = "200px";
    }
    indicator.style.background = "white";
    indicator.style.opacity = "0";
}

var indicator = document.getElementById("indicator");
var like = document.getElementById("like");
function handleMove(e) {
    event.preventDefault();
//        console.log("touchmove");
//        console.log("("+e.touches[0].clientX+", "+ e.touches[0].clientY+")");
    theTouch[2] = e.touches[0].clientX;
    theTouch[3] = e.touches[0].clientY;
    var dist_obj = calculate_distance();
    //calculate opacity based on distance if threshold = false
    var color;
    switch (dist_obj[1]) {
        case 0:
            resetIndicators(0);
            color = "#75C6FF";
            if (search_open == false) {
                if (dist_obj[2] == false) {
                    var percentOpacity = dist_obj[0] / radius * 0.4;
                    like.style.opacity = percentOpacity;
                    var top = 200 - dist_obj[0];
                    like.style.top = top + "px";
                }
                else {
                    like.style.opacity = "1";
                }
            }
            break;
        case 1:
            resetIndicators(1);
            color = "#ECFF99";
            break;
        case 2:
            resetIndicators(2);
            color = "#87FFB9";
            break;
        case 3:
            resetIndicators(3);
            color = "#FFA1E4";
            break;
        default:
            color = "white";
            break;
    }
}

//change card forward or back | -1 to go back, 1 to go forward
var current_card = 0;
var max_cards = 8;
function change_card(a) {
//    console.log(current_card);
    if (a == 1 || a == -1) { //only accept 1 or -1 as valid
        var temp = current_card;
        current_card += a;
        if (current_card >= max_cards + 1) { // this shouldn't be allowable (or should trigger a search for new content?)
            current_card = 0;
        }
        if (current_card <= -1) { // this should cause new content to load?
            current_card = max_cards;
        }
        if(current_card == max_cards - 2){

        }
        var prev_card = document.getElementById("card" + temp);
        prev_card.style.opacity = 0;
        var next_card = document.getElementById("card" + current_card);
        next_card.style.opacity = 1;
//        console.log(current_card);
    }
    else {
        return false;
    }
}

//-1 to hide tray, 1 to display tray
var search_tray = document.getElementById("search");
function toggle_search(a){
    if(a == -1){
        search_tray.style.top = "-462px";
        search_open = false;
    }
    else if(a == 1){
        search_tray.style.top = "0px";
        search_open = true;
    }
}

//startup();
