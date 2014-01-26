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
      $('#'+id+'_status').html('uploading the file ...');

    $(this).ajaxSubmit({                                                                                                                 

      error: function(xhr) {
        $('#'+id+'_status').html('Error: ' + xhr.status);
      },

      success: function(response) {

        if(response.error) {
            $('#'+id+'_status').html('Opps, something bad happened');
            return;
        }
        //$('#'+id+'_status').html('Success!');
      }
    });
   
    // Stop the form from submitting and causing a page refresh                                                                                                                    
    return false;
  });

}