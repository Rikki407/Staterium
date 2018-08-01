// correctAnswerIndex: 2, answerDiscussion: `All market traded commodities float
// in value, including currencies. \nFor a discussion of state issued cryptotokens read more here: https://mashable.com/2018/01/08/cryptocurrency-bitcoin-governments/`
let answer = '';

let checkAnswer = () => {
    $.ajax({
        type: 'POST',
        url: '/gk/submit',
        data: {
            answer: getCheckedValue('answers')
        },
        success: data => {
            console.log(data.answer_correct);
            returnScore(data.answer_correct);
        }
    });
};

function getCheckedValue(radioName) {
    var radios = document.getElementsByName(radioName); // Get radio group by-name
    for (var y = 0; y < radios.length; y++) {
        if (radios[y].checked) return radios[y].value;
    } // return the checked value
}

function returnScore(isCorrect) {
    //alert("Your score is "+ getScore() +"/"+ tot);
    document.getElementById('submit_answer').innerHTML =
        'Your answer is ' + isCorrect;
}
