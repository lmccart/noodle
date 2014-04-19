var task = {
  trigger: [],
  query: {},
  actions: []
};

var inserts = [ 'detects', ',', 'to', ',', 'to', '', 'to', '', 'to', ''];
var inserts_i = 0;

var triggers = {
  audio: ['loud noise', 'quiet', 'speech'],
  camera: ['movement', 'a face', 'darkness', 'brightness'],
  clock: ['an hour has passed', 'a minute has passed', 'a day has passed'],
  gpio: ['pin 0 low', 'pin 0 high', 'pin 1 low', 'pin 1 high', 'pin 2 low', 'pin 2 high', 'pin 3 low', 'pin 3 high', 'pin 4 low', 'pin 4 high']
};

var inputs = {
  microphone: ['record 3s', 'record 10s'],
  camera: ['take a photo', 'record 10s of video'],
  gpio: ['pin 0', 'pin 1', 'pin 2', 'pin 3', 'pin 4']
};

var actions = {
  audio: ['play', 'speak'],
  gpio: {'pin 0': ['high', 'low'],
    'pin 1': ['high', 'low'],
    'pin 2': ['high', 'low'],
    'pin 3': ['high', 'low'],
    'pin 4': ['high', 'low']
  },
  display: { show: ['image', 'text']}
};


window.onload=function(){
  createDrop($('#triggers'), triggers, startQuery);
  $('#trigger-selection').show();


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
    $('#input-selection .part select').each(function(e) {
      task.query.input.push($(this).val());
    });
    task.query.question = $('input#question').val();

    // add choices for mc
    if (task.query.type === 'mc') {
      task.query.choices = [];
      $('#query-selection input.mc').each(function(e) {
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

  hookInput();

  $('#question-type').change(function() {
    resizeForContent('#'+$(this).attr('id'), $('#question-type option:selected').text());
  });

  // $('input').change(function() {
  //   console.log($(this).val().length, $(this).val());
  //   if ($(this).val().length == 0) $(this).val('____________');
  // });

  // login page
  $('#login').click(function(e){
    window.location = "./?a="+encodeURIComponent($('input#access_key_id').val())+"&s="+encodeURIComponent($('input#secret_access_key').val());
  });

  // manage page
  $('.remove').click(function(e){
    var hit = $(e.target).parent()[0].id;
    window.location = './remove?hit='+hit;
  });


};

function createDrop(elt, obj, cb) {
  var is_arr = (Object.prototype.toString.call( obj ) === '[object Array]');

  var keys = [];
  if (is_arr) {
    keys = obj;
  } else {
    _.each( obj, function( val, key ) { keys.push(key); });
  }

  var insert = '<select><option value="">_______</option>';
  for (var i=0; i<keys.length; i++) {
    insert += '<option value="'+keys[i]+'">'+keys[i]+'</option>';
  }
  insert += '</select>';
  elt.html(insert);

  var selector = '#'+elt.attr('id')+' select';
  resizeForContent(selector, '_______');

  resizeForContent(elt.attr('id')+' select', '_______');

  $(selector).change(function(){
    resizeForContent(selector, $(this).val());

    //task.trigger.push($(this).val());
    var new_id = elt.attr('id') + '_';
    if (is_arr) {
      eraseAllAfter(elt);
      addInserts(elt.parent());
      if ($(this).val() == 'play') {
        elt.parent().append(' <form id="'+new_id+'_uploadForm" enctype="multipart/form-data" action="/upload" method="post"><input type="file" id="'+new_id+'_uploadInput" name="upload" /></form><span id="'+new_id+'_status" />.');
        hookUpload(new_id);
      }

      else if ($(this).val() == 'speak') {
        elt.parent().append(' "<input type="text" class="part" id="'+new_id+'" value="____________"/>".');
        resizeForContent('#'+new_id, $('#'+new_id).val());
        hookInput();
      }
      
      if (cb) cb();
      $('#'+new_id).change(function() {    
        if (cb) cb();
      });
    } else {
      eraseAllAfter(elt);
      addInserts(elt.parent());
      elt.parent().append(' <span class="part" id="'+new_id+'"></span>');
      elt.parent().append(createDrop($('#'+new_id), obj[$(this).val()], cb));
    }
  });
  
}

function addInserts(elt) {
    if (inserts_i < inserts.length) {
      elt.append(' <span class="inserts" id="inserts_'+inserts_i+'">'+inserts[inserts_i]+'</span>');
      inserts_i++;
    }
}

function resizeForContent(selector, content) {
  $('#test').html(content);
  $(selector).width($('#test').width());
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

  inserts_i = $('body').find('.inserts').length;
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

  $('#query-selection input.mc').change(function() {
    buildActions();
  });

}

function buildActions() {
  $('#action-selection').empty();
  var choices = [];
  if (task.query.type === 'tf') {
    choices = ['yes', 'no'];
  } else if (task.query.type === 'sa') {
    choices = ['anything'];
  } else if (task.query.type === 'mc') {
    $('#query-selection input.mc').each(function(e) {
      if ($(this).val().indexOf('____') == -1 && $(this).val().length > 0) choices.push($(this).val());
    });
  }

  _.each(choices, function(c) {
    if (c != '') {
      var new_id = 'action_'+c;
      $('#action-selection').append('<div class="action" id="'+new_id+'">If the answer is '+c+': use the <span class="part" id="'+new_id+'_"></span></div>');
      createDrop($('#'+new_id+'_'), actions, null);
    }
  });

  // pend
  $('#submit').show();
}

// function updateMC() {
//   var choices = [];
//   $('#query-selection input.mc').each(function(e) {
//     if ($(this).val().indexOf('____') == -1 && $(this).val().length > 0) choices.push($(this).val());
//   });

//   var adivs = $('#action-selection .action');
  
//   for (var i=0; i<Math.max(adivs.length, choices.length); i++) {
//     if (i < choices.length) {
//       var new_id = 'action_'+choices[i];
//       var new_div = '<div class="action" id="'+new_id+'">If the answer is '+choices[i]+': use the <span class="part" id="'+new_id+'_"></span></div>';
        
//       if (i < adivs.length && adivs[i].id != new_id) {
//         $(new_div).insertBefore('#'+adivs[i].id); 
//         createDrop($('#'+new_id+'_'), actions, null);
//       } else if (i >= adivs.length) {
//         $('#action-selection').append(new_div);
//         createDrop($('#'+new_id+'_'), actions, null);
//       }
//     } 
//   }

//   adivs = $('#action-selection .action');
//   for (var i=0; i<adivs.length; i++) {
//     if (!_.contains(choices, adivs[i].id.substring(7))) {
//       $('#'+adivs[i].id).remove();
//     }
//   }
// }



// helper for uploads
function hookUpload(id) {

  // Check to see when a user has selected a file                                                                                                                
  var timerId;
  timerId = setInterval(function() {
    if($('#'+id+'_uploadInput').val() !== '') {
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

function hookInput() {
  $('input').on('focus', function(){
    $(this).val('');
    //resizeForContent('#'+$(this).attr('id'), $(this).val());
  });

  $('input').on('focusout', function(){
    if ($(this).val().length == 0) $(this).val('____________');
    resizeForContent('#'+$(this).attr('id'), $(this).val());
  });

  $('input').on('keydown', function(){
    resizeForContent('#'+$(this).attr('id'), $(this).val()+'m');
  });

  $('input').each(function(e) {
    resizeForContent('#'+$(this).attr('id'), $(this).val());
  });
}
