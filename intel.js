
module.exports = function(settings) {

	var creds = require('./config'),
			mturk  = require('./mturk')({creds: creds, sandbox: true}),
			fs = require('fs'),
			util = require("util");

	var RegisterHITTypeOptions = { 
	  Title: "Mturk Nodejs module RegisterHITType test"
	  , Keywords: "keyword1, keyword2, keyword3" 
	  , Description: "Test description"
	  , Reward: {Amount: 1.0, CurrencyCode: "USD"}
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
      var hits = (result.HIT instanceof Array) ? result.HIT : [result.HIT];
      hits.forEach(function(HIT){
      	if (HIT) {
	      	console.log(HIT);
	        // For each reviewable HIT, get the assignments that have been submitted
	        mturk.GetAssignmentsForHIT({ "HITId": HIT.HITId }, function(err, result){
	          var assignments = (result.Assignment instanceof Array) ? result.Assignment : [result.Assignment];
	          assignments.forEach(function(assignment){
	            console.log( util.inspect(assignment) );

	            // Here you could do
	            // mturk.ApproveAssignment({"AssignmentId": assignment.AssignmentId, "RequesterFeedback": "Great work!"}, function(err, id){ 
	                    // Now assignment "id" is approved!
	            // });
	          });
	        });
	      }
      });
		});
	};

	var checkInterval = setInterval(intel.checkForHits, 5000);

	return intel;
};
