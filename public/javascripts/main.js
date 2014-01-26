var task = {
  trigger: [],
  query: {},
  actions: []
};

var triggers = {
  audio: ['loud noise', 'quiet'],
  camera: {
    movement: ['is bigger than', 'makes more sense than'],
    faces: ['is bigger than', 'makes more sense than']
  },
  clock: {
    time: ['is later than', 'is better than']
  }
};

var inputs = {
  microphone: ['record 3s', 'record 10s'],
  camera: ['take a photo', 'record 10s of video']
};

var actions = {
  audio: ['play']
};


window.onload=function(){
  createDrop($('#triggers'), triggers, startQuery);
  $('#trigger-selection').show();
};

function createDrop(elt, obj, cb) {
  var is_arr = (Object.prototype.toString.call( obj ) === '[object Array]');

  var keys = [];
  if (is_arr) {
    keys = obj;
  } else {
    _.each( obj, function( val, key ) { keys.push(key); });
  }

  var insert = '<select><option value=""></option>';
  for (var i=0; i<keys.length; i++) {
    insert += '<option value="'+keys[i]+'">'+keys[i]+'</option>';
  }
  insert += '</select>';
  elt.html(insert);
  $('#'+elt.attr('id')+' select').change(function(){
    //task.trigger.push($(this).val());
    var new_id = elt.attr('id') + '_';
    if (is_arr) {
      eraseAllAfter(elt);
      if (keys[0] == 'play') {
        elt.parent().append('<form id="'+new_id+'_uploadForm" enctype="multipart/form-data" action="/upload" method="post"><input type="file" id="'+new_id+'_userPhotoInput" name="userPhoto" /></form><span id="'+new_id+'_status" />');
        hookUpload(new_id);
      }
      
      if (cb) cb();
      $('#'+new_id).change(function() {    
        if (cb) cb();
      });
    } else {
      eraseAllAfter(elt);
      elt.parent().append('<span class="part" id="'+new_id+'"></span>');
      elt.parent().append(createDrop($('#'+new_id), obj[$(this).val()], cb));
    }
  });
  
}

function eraseAllAfter(elt) {
  var all = elt.parent().children();
  var found = false;
  for (var i=0; i<all.length; i++) {
    if (found) {
      $('#'+all[i].id).remove();
    }
    if (elt.attr('id') == all[i].id) {
      found = true;
    }
  }
}

function startQuery() {
  $('#input-selection').show();
  createDrop($('#input-type'), inputs, null);

  $('#query-selection').show();
  $('#question-type').change(function(){
    task.query.type = ($(this).val());    
    $('#action-selection').show();
    $('#action-selection').html('');
    if ($(this).val() === 'mc') $('#query-selection .submodule').show();
    else {
      $('#query-selection .submodule').hide()
    }
    buildActions();
  });

  $('#query-selection input').change(function() {
    updateMC();
  });

}

function buildActions() {
  var choices = [];
  if (task.query.type === 'tf') {
    choices = ['true', 'false'];
  } else if (task.query.type === 'sa') {
    choices = ['anything'];
  }

  _.each(choices, function(c) {
    if (c != '') {
      var new_id = 'action_'+c;
      $('#action-selection').append('<div class="action" id="'+new_id+'">If the human answers '+c+': <span class="part" id="'+new_id+'_"></span></div>');
      createDrop($('#'+new_id+'_'), actions, null);
    }
  });
}

function updateMC() {
  var choices = [];
  $('#query-selection input').each(function(e) {
    if ($(this).val().length > 0) choices.push($(this).val());
  });

  var adivs = $('#action-selection .action');
  
  for (var i=0; i<Math.max(adivs.length, choices.length); i++) {
    if (i < choices.length) {
      var new_id = 'action_'+choices[i];
      var new_div = '<div class="action" id="'+new_id+'">If the human answers '+choices[i]+': <span class="part" id="'+new_id+'_"></span></div>';
        
      if (i < adivs.length && adivs[i].id != new_id) {
        $(new_div).insertBefore('#'+adivs[i].id); 
        createDrop($('#'+new_id+'_'), actions, null);
      } else if (i >= adivs.length) {
        $('#action-selection').append(new_div);
        createDrop($('#'+new_id+'_'), actions, null);
      }
    } 
  }

  adivs = $('#action-selection .action');
  for (var i=0; i<adivs.length; i++) {
    if (!_.contains(choices, adivs[i].id.substring(7))) {
      $('#'+adivs[i].id).remove();
    }
  }
}

// index page
$('#submit').click(function(e){
  // add triggers
  $('#trigger-selection select').each(function() {
    task.trigger.push($(this).val());
  });
  $('#trigger-selection input').each(function() {
    task.trigger.push($(this).val());
  });

  // add query
  task.query.input = [];
  $('#input-selection select').each(function(e) {
    task.query.input.push($(this).val());
  });
  task.query.question = $('textarea#question').val();

  // add choices for mc
  if (task.query.type === 'mc') {
    task.query.choices = [];
    $('#query-selection input').each(function(e) {
      task.query.choices.push($(this).val());
    });
  }

  // add actions
  $('#action-selection .action').each(function() {
    var a = [];
    $(this).find('select').each(function() {
      a.push($(this).val());
    });
    $(this).find('input').each(function() {
      var str = $(this).val();
      var n = str.lastIndexOf('\\'); // kill the full path
      a.push(str.substring(n+1));
    });
    task.actions.push(a);
  });

  console.log(task);
  $.ajax({
    url:"/add",
    type:"POST",
    data:task, 
    success:function (res) { console.log(res); window.location = './manage' }
  });
});

// login page
$('#login').click(function(e){
  window.location = './?s='+$('input#secret_key').val()+'&a='+$('input#access_key').val();
});

// manage page
$('.remove').click(function(e){
  var hit = $(e.target).parent()[0].id;
  window.location = './remove?hit='+hit;
});


// helper for uploads
function hookUpload(id) {

  // Check to see when a user has selected a file                                                                                                                
  var timerId;
  timerId = setInterval(function() {
    if($('#'+id+'_userPhotoInput').val() !== '') {
      clearInterval(timerId);
      $('#'+id+'_uploadForm').submit();
    }
  }, 500);
   
  $('#'+id+'_uploadForm').submit(function() {
      //$('#'+id+'_status').html('uploading the file ...');

    $(this).ajaxSubmit({                                                                                                                 

      error: function(xhr) {
        $('#'+id+'_status').html('Error: ' + xhr.status);
      },

      success: function(response) {

        if(response.error) {
            $('#'+id+'_status').html('Oops, something bad happened');
            return;
        }
        //$('#'+id+'_status').html('Success!');
      }
    });
   
    // Stop the form from submitting and causing a page refresh                                                                                                                    
    return false;
  });

}
