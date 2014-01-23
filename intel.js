
module.exports = function(params) {

  var fs = require('fs')
      , util = require("util")
      , parseString = require('xml2js').parseString
      , json2xml = require('json2xml');

  var intel = {};
  intel.mturk = null;
  intel.checkInterval = null;

  // attempt login from config file
  fs.readFile('./data/config.json', 'utf8', function(err, data) {
    if (data) data = JSON.parse(data);
    if (data.accessKey && data.secretKey) {
      intel.login(data);
    }
  });


  // fs.readFile("./data/question_form_sa.xml", 'utf8', function(err, data) {
  //   if (err) throw err;

  //   console.log(data)
  //   parseString(data, function (err, result) {
  //     console.log(result);
  //     result.QuestionForm.Question[0].QuestionContent[0].Text[0] = ["Hello hi"];
  //     result = json2xml(result, '  ');
      
  //     fs.writeFile('./data/question_form_sa.xml', result, function(err, data) {
  //       if (err) throw err;
  //     });
  //   });
  // });


  var RegisterHITTypeOptions = { 
    Title: "Mturk Nodejs module RegisterHITType test"
    , Keywords: "keyword1, keyword2, keyword3" 
    , Description: "Test description"
    , Reward: {Amount: 0.01, CurrencyCode: "USD"}
    , AssignmentDurationInSeconds: 3600
    , AutoApprovalDelayInSeconds: 3600
    , QualificationRequirement: []
  };

  intel.login = function(params) {
    intel.mturk =  require('./mturk')({creds: params, sandbox: false});

    fs.readFile('./data/config.json', 'utf8', function(err, data) {
      if (data) data = JSON.parse(data);
      else data = {};
      data.accessKey = params.accessKey;
      data.secretKey = params.secretKey;
  
      fs.writeFile('./data/config.json', JSON.stringify(data), function (err) {
        if (err) throw err;
      });
    });

    console.log('logged in');
  }

  intel.createHit = function(task, func){
    console.log('create hit '+task);


    RegisterHITTypeOptions.Title = 'testing';


      // Step 1: First we have to create a HITTypeId
    intel.mturk.RegisterHITType(RegisterHITTypeOptions, function(err, HITTypeId){
      if (err) throw err;

      fs.readFile("./data/question_form_sa.xml", 'utf8', function(err, data) {
        if (err) throw err;

        parseString(data, function (err, result) {
          console.log(result);
          result.QuestionForm.Question[0].QuestionContent[0].Text[0] = [task.query.question];

          result.attr = {xmlns:"http://mechanicalturk.amazonaws.com/AWSMechanicalTurkDataSchemas/2005-10-01/QuestionForm.xsd"};
          result = json2xml(result, { attributes_key:'attr' });
          
          var CreateHITOptions = {
            'HITTypeId': HITTypeId
            , 'Question': result
            , 'LifetimeInSeconds': 60 * 20  // How long should the assignment last?
            , 'MaxAssignments': 1
          };
          console.log('register '+HITTypeId);

          // Step 2: Now create the HIT itself.
          intel.mturk.CreateHIT(CreateHITOptions, function(err, HITId){
            if (err) throw err;
            console.log("Created HIT "+HITId);

            // callback
            func(HITId);
          }); 
        });


      });
    });

  }

  intel.removeHit = function(params){

    intel.mturk.DisableHIT(params, function(err, HITId) {
      if (err) console.log(err);
      console.log("disabled hit "+HITId);
    });

  }

  intel.checkForHits = function(tasks) {
    intel.mturk.GetReviewableHITs({}, function(err, result){
      if (result) {
        var hits = (result.HIT instanceof Array) ? result.HIT : [result.HIT];
        hits.forEach(function(HIT){
          //console.log(HIT);
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
                      var task = _.find(tasks, function(t) { return t.id == HIT.HITId; });
                      
                      if (task) {
                        task.status = 2; // update status to responded
                        task.query.answer = answer;
                      }
                  });
                }
              }
            });
          });
          
        });
      }
    });
  };

  return intel;
};



/*

TASK (format)

date - date
status - int
trigger - 
query - obj
  input - 
  question - string
action - 




STATUS

0 - set
1 - triggered
2 - responded

*/

