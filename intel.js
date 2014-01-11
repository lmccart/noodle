
module.exports = function(settings) {

	var fs = require('fs')
			, util = require("util")
			, parseString = require('xml2js').parseString;

	var intel = {};
	intel.mturk = null;
	intel.checkInterval = null;

	// attempt login from config file
	fs.readFile('./data/config.json', 'utf8', function(err, data) {
	  data = JSON.parse(data);
	  if (data.accessKey && data.secretKey) {
	    intel.mturk =  require('./mturk')({creds: data, sandbox: false});
	    intel.checkInterval = setInterval(intel.checkForHits, 5000);
	  }
	});


			// fs.writeFile('./data/config.json', JSON.stringify(data), function (err) {
			//   if (err) throw err;
			// });

	intel.tasks = [];

	// load stored tasks
	fs.readFile('./data/tasks.txt', 'utf8', function(error, data) {
	  var lines = data.match(/[^\r\n]+/g);
	  if (lines) {
	  	lines.forEach(function(line){
	  		intel.tasks.push(line); 
	  	});
	  }
	});

	var RegisterHITTypeOptions = { 
	  Title: "Mturk Nodejs module RegisterHITType test"
	  , Keywords: "keyword1, keyword2, keyword3" 
	  , Description: "Test description"
	  , Reward: {Amount: 0.01, CurrencyCode: "USD"}
	  , AssignmentDurationInSeconds: 3600
	  , AutoApprovalDelayInSeconds: 3600
    , QualificationRequirement: []
	};

	
	intel.createHit = function(params){
		//console.log(params);
		RegisterHITTypeOptions.Title = params.title;

			// Step 1: First we have to create a HITTypeId
		intel.mturk.RegisterHITType(RegisterHITTypeOptions, function(err, HITTypeId){
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
		    intel.mturk.CreateHIT(CreateHITOptions, function(err, HITId){
		      if (err) throw err;
		      console.log("Created HIT "+HITId);
		      intel.tasks.push(HITId);

		      // sync storage
					fs.writeFile('./data/tasks.txt', intel.tasks.join('\n'), function (err) {
					  if (err) throw err;
					});

		    }); 
		  });
		});

	}

	intel.removeHit = function(params){

		var index = intel.tasks.indexOf(params.HITId);
		if (index > -1) {
		    intel.tasks.splice(index, 1);

				// sync storage    
				fs.writeFile('./data/tasks.txt', intel.tasks.join('\n'), function (err) {
				  if (err) throw err;
				});
		}

		intel.mturk.DisableHIT(params, function(err, HITId) {
			if (err) console.log(err);
			console.log("disabled hit "+HITId);
		});



	}

	intel.checkForHits = function() {
		intel.mturk.GetReviewableHITs({}, function(err, result){
			if (result) {
	      var hits = (result.HIT instanceof Array) ? result.HIT : [result.HIT];
	      hits.forEach(function(HIT){
	      	console.log(HIT);
	        // For each reviewable HIT, get the assignments that have been submitted
	        intel.mturk.GetAssignmentsForHIT({ "HITId": HIT.HITId }, function(err, result){
	          var assignments = (result.Assignment instanceof Array) ? result.Assignment : [result.Assignment];
	          assignments.forEach(function(assignment){
	          	if (assignment) {
		          	if (assignment.AssignmentStatus === "Submitted") {

			            intel.mturk.ApproveAssignment({"AssignmentId": assignment.AssignmentId, "RequesterFeedback": "Great work!"}, function(err, id){ 
			            	console.log("approved "+assignment.AssignmentId);
			            });

									parseString(assignment.Answer, function (err, result) {
											var answer = result.QuestionFormAnswers.Answer[0].FreeText[0];
									    console.dir(answer);

									    // act on the result
									    intel.actOnResponse({"hit": HIT.HITId, "response": answer});

									});
								}
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

	return intel;
};
