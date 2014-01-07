
module.exports = function(settings) {

	var creds = require('./config'),
			mturk  = require('./mturk')({creds: creds, sandbox: true}),
			fs = require('fs');

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
		    });  // mturk.CreateHIT
		  });
		});

	}

	return intel;
};
