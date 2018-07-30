// correctAnswerIndex: 2, answerDiscussion: `All market traded commodities float
// in value, including currencies. \nFor a discussion of state issued cryptotokens read more here: https://mashable.com/2018/01/08/cryptocurrency-bitcoin-governments/`
var answer = 'C';


function getCheckedValue(radioName) {
    var radios = document.getElementsByName(radioName); // Get radio group by-name
    for (var y = 0; y < radios.length; y++) {
        console.log(radios[y].value);
        if (radios[y].checked) return radios[y].value;
    } // return the checked value
}

function getScore() {
    return (getCheckedValue('answers') === answer) // increment only
}

function returnScore(){
  //alert("Your score is "+ getScore() +"/"+ tot);
  document.getElementById("submit_answer").innerHTML = "Your answer is "+ getScore();
}

