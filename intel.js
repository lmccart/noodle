
module.exports = function(settings) {

	var parseString = require('xml2js').parseString;

	var creds = require('./config'),
			mturk  = require('./mturk')({creds: creds, sandbox: false}),
			fs = require('fs'),
			util = require("util");

	var RegisterHITTypeOptions = { 
	  Title: "Mturk Nodejs module RegisterHITType test"
	  , Keywords: "keyword1, keyword2, keyword3" 
	  , Description: "Test description"
	  , Reward: {Amount: 0.01, CurrencyCode: "USD"}
	  , AssignmentDurationInSeconds: 3600
	  , AutoApprovalDelayInSeconds: 3600
	  , QualificationRequirement: [mturk.QualificationRequirements.Adults]
	};

	var intel = {};

	intel.openHits = [];
	
	intel.createHit = function(params){
		console.log(params);
		RegisterHITTypeOptions.Title = params;

			// Step 1: First we have to create a HITTypeId
		mturk.RegisterHITType(RegisterHITTypeOptions, function(err, HITTypeId){
		  if (err) throw err;

		  fs.readFile("./data/QuestionForm.xml", 'utf8', function(err, questionXML) {
		    if (err) throw err;


		    var CreateHITOptions = {
		      'HITTypeId': HITTypeId
		      , 'Question': questionXML
		      , 'LifetimeInSeconds': 60 * 20  // How long should the assignment last?
		      , 'MaxAssignments': 1
		    };

		    // Step 2: Now create the HIT itself.
		    mturk.CreateHIT(CreateHITOptions, function(err, HITId){
		      if (err) throw err;
		      console.log("Created HIT "+HITId);
		      intel.openHits.push(HITId);
		    });  // mturk.CreateHIT
		  });
		});

	}

	intel.checkForHits = function() {
		mturk.GetReviewableHITs({}, function(err, result){
			if (result) {
	      var hits = (result.HIT instanceof Array) ? result.HIT : [result.HIT];
	      hits.forEach(function(HIT){
	      	console.log(HIT);
	        // For each reviewable HIT, get the assignments that have been submitted
	        mturk.GetAssignmentsForHIT({ "HITId": HIT.HITId }, function(err, result){
	          var assignments = (result.Assignment instanceof Array) ? result.Assignment : [result.Assignment];
	          assignments.forEach(function(assignment){
	          	if (assignment.AssignmentStatus === "Submitted") {

		            // mturk.ApproveAssignment({"AssignmentId": assignment.AssignmentId, "RequesterFeedback": "Great work!"}, function(err, id){ 
		            // 	console.log("approved "+assignment.AssignmentId);
		            // });

								parseString(assignment.Answer, function (err, result) {
										var answer = result.QuestionFormAnswers.Answer[0].FreeText[0];
								    console.dir(answer);

								    // act on the result
								    intel.actOnResponse({"hit": HIT.HITId, "response": answer});

								});

	        		}

	          });
	        });
		      
	      });
			}
		});
	};

	intel.actOnResponse = function(resp) {
		console.log(resp);
	};

	//var checkInterval = setInterval(intel.checkForHits, 5000);
	intel.checkForHits();

	return intel;
};
