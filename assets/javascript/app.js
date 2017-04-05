// Initialize Firebase
var config = {
    apiKey: "AIzaSyAAFg6iXb-d5SvGQlh5kCgNKPVuBr8Aeuc",
    authDomain: "skatesting-378e8.firebaseapp.com",
    databaseURL: "https://skatesting-378e8.firebaseio.com",
    storageBucket: "skatesting-378e8.appspot.com",
    messagingSenderId: "282587104593"
};
firebase.initializeApp(config);

// Create a variable to reference the database.
var dbRef = firebase.database();

// Initial assignments for variables.
var trainName = "";
var destination = "";
var firstTrainTime = "";
var frequency = 0;
var minutesAway = 0;
var nextArrival = 0;

function clearFormInput() {

    $('input').each(
        function(){
            trainName = "";
            destination = "";
            firstTrainTime = "";
            frequency = "";
            $("#train-name").val(trainName);
            $("#destination").val(destination);
            $("#first-train-time").val(firstTrainTime);
            $("#frequency").val(frequency);
        });
}

function calcTrainArrival(firstTime, frequency) {

    var firstTimeConverted = 0;
    var currentTime = 0;
    var diffTime = 0;
    var tRemainder = 0;

    // First Time (pushed back 1 year to make sure it comes before current time)
    firstTimeConverted = moment(firstTime, "hh:mm").subtract(1, "years");
    // console.log(firstTimeConverted);

    // Current Time
    currentTime = moment();
    // console.log("CURRENT TIME: " + moment(currentTime).format("hh:mm"));

    // Difference between the times
    diffTime = moment().diff(moment(firstTimeConverted), "minutes");
    // console.log("DIFFERENCE IN TIME: " + diffTime);

    // Time apart (remainder)
    tRemainder = diffTime % frequency;
    // console.log(tRemainder);

    // Minutes until Train
    minutesAway = frequency - tRemainder;
    If (minutesAway < 0) {
        minutesAway = 0;
    }
    // console.log("MINUTES TILL TRAIN: " + minutesAway);

    // Next Train
    nextArrival = moment().add(minutesAway, "minutes");
    // console.log("ARRIVAL TIME: " + moment(nextArrival).format("hh:mm"));
}

$('#submit').on("click", function(event) {

    // Prevent default behavior
    event.preventDefault();

    // Get the input values
    trainName = $("#train-name").val().trim();
    destination = $("#destination").val().trim();
    firstTrainTime = $("#first-train-time").val().trim();
    frequency = parseInt($("#frequency").val().trim());

    // Creates local "temporary" object for holding train data
    dbRef.ref().push({
        train: trainName,
        dest: destination,
        firstTrain: firstTrainTime,
        freq: frequency,
        dateAdded: firebase.database.ServerValue.TIMESTAMP
    });

    calcTrainArrival(firstTrainTime, frequency);

    clearFormInput();
});

dbRef.ref().on("child_added", function(snapshot) {

    // Log everything that's coming out of snapshot
    // console.log(snapshot.val());
    // console.log(snapshot.val().train);
    // console.log(snapshot.val().dest);
    // console.log(snapshot.val().firstTrain);
    // console.log(snapshot.val().freq);
    // console.log(snapshot.val().dateAdded);

    calcTrainArrival(snapshot.val().firstTrain, snapshot.val().freq);

    // Add each train's data into the table
    $("#train-table > tbody").append("<tr><td>" + snapshot.val().train + "</td><td>" + snapshot.val().dest + "</td><td>" +
      snapshot.val().freq + "</td><td>" + moment(nextArrival).format("hh:mm A") + "</td><td>" + minutesAway + "</td></tr>");

    // Handle the errors
}, function(errorObject) {
    console.log("Errors handled: " + errorObject.code);
});