//Usage:  grunt accept:(SP|FA|SU):2015:(DOM|INT):

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    settings:{
      baseDestination: 'dest/',
      program: 'PTP',
      citizenship: 'DOM',
      admitType: 'FRESH',
      session: 'FALL'
    },
    copy: {
      letter:{ //Every folder
        src: '*.pdf',
        dest: 'dest/<%= settings.firstName %> <%= settings.lastName %>.pdf',
      },
      Health:{
        expand: true,
        cwd: 'sources/health/',
        src: '*.pdf',
        dest: '<%= settings.baseDestination %>'
      },
      Calendar:{ //Every folder
        expand: false, 
        flatten: true, 
        src: ['sources/calendar/Calendar-<%= settings.program %>.pdf'], 
        dest: '<%= settings.baseDestination %>Calendar.pdf', 
        filter: 'isFile'
      },
      Checklist:{ //Program: PTP only
        expand: false, 
        flatten: true, 
        src: ['sources/checklist/Checklist-<%= settings.citizenship %>.pdf'], 
        dest: '<%= settings.baseDestination %>Checklist.pdf', 
        filter: 'isFile'
      },
      Consent:{ //Every folder
        expand: true, 
        flatten: true, 
        src: ['sources/consent/Consent to Release.pdf'], 
        dest: '<%= settings.baseDestination %>', 
        filter: 'isFile'
      },
      Housing:{ //Program: PTP only
        expand: true, 
        flatten: true, 
        src: ['sources/housing/Housing Information 67 Livingston.pdf'], 
        dest: '<%= settings.baseDestination %>', 
        filter: 'isFile'
      },
      Roommate:{ //Every folder
        expand: true, 
        flatten: true, 
        src: ['sources/housing/Housing Agreement and Roommate Questionnaire.pdf'], 
        dest: '<%= settings.baseDestination %>', 
        filter: 'isFile'
      },
      I20:{ //Citizenship: INT only
        expand: true, 
        cwd: 'sources/I-20/',
        src: '*.pdf', 
        dest: '<%= settings.baseDestination %>', 
        filter: 'isFile'
      },
      EnrollmentAgreement_PTP:{ //Every folder
        expand: false, 
        flatten: true, 
        src: 'sources/enrollment-agreement/Enrollment Agreement-<%= settings.program %>-<%= settings.citizenship %>-<%= settings.admitType %>.pdf', 
        dest: '<%= settings.baseDestination %>/Enrollment Agreement.pdf', 
        filter: 'isFile'
      },
      EnrollmentAgreement_SUMMER:{ //Every folder
        expand: false, 
        flatten: true, 
        src: 'sources/enrollment-agreement/Enrollment Agreement-<%= settings.session %>.pdf', 
        dest: '<%= settings.baseDestination %>/Enrollment Agreement.pdf', 
        filter: 'isFile'
      },
      TermsAndConditions:{ //Every folder
        expand: false, 
        flatten: true, 
        src: 'sources/terms/Terms & Conditions-<%= settings.admitType %>.pdf', 
        dest: '<%= settings.baseDestination %>/Terms & Conditions.pdf', 
        filter: 'isFile'
      },
      Transcript:{ //Program: PTP only, Citizenship: INT only
        expand: true, 
        flatten: true, 
        cwd: 'sources/transcript-evaluation/',
        src: '*.pdf', 
        dest: '<%= settings.baseDestination %>', 
        filter: 'isFile'
      }
    },
    zip: {
      main:{
        cwd: 'dest/**.pdf',
        src: ['dest/**'],
        dest: '<%= settings.firstName %> <%= settings.lastName %> Acceptance Packet.zip'
      }
    },
    clean:{
      dest:{
        src: ['dest/', '**.zip']
      },
      letter:{
        src: ['**.pdf']
      }
    },
    letter:{
      letter: {
        files: [
            {src: ['**.pdf'], dest: 'dest/'}
        ]
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-zip');
  grunt.loadNpmTasks('grunt-contrib-clean');

  // Setup and Finishing tasks
  grunt.registerTask('setup', ['clean:dest']);
  grunt.registerTask('finish', ['zip']);

  //conditional tasks
  grunt.registerTask('PTP-SPRING', ['copy:Health']);
  grunt.registerTask('PTP-INT', ['copy:Transcript']);
  grunt.registerTask('International', ['copy:I20']);
  
  grunt.registerTask('PTP', ['copy:Checklist', 
                             'copy:Housing',
                             'copy:TermsAndConditions',
                             'copy:EnrollmentAgreement_PTP']);

  grunt.registerTask('SUMMER', ['copy:EnrollmentAgreement_SUMMER']);
  //Global: for every folder
  grunt.registerTask('global', ['copy:letter',
                                'copy:Calendar',
                                'copy:Roommate', 
                                'copy:Consent']);


  //START : Default
  grunt.registerTask('default', ['clean:dest', 'letter', 'global', 'conditionals', 'announce', 'finish', 'clean:letter']);


  grunt.registerTask('conditionals', 'add the pdfs based on the config settings', function(){

    var program = grunt.config('settings.program'),
        citizenship = grunt.config('settings.citizenship'),
        session = grunt.config('settings.session');

    if (program == 'PTP') grunt.task.run('PTP');
    if (program == 'PTP' && citizenship == 'INT') grunt.task.run('PTP-INT');
    if (program == 'PTP' && session == 'SPRING') grunt.task.run('PTP-SPRING');
    if (citizenship == 'INT') grunt.task.run('International');
    if (program == 'SUMMER') grunt.task.run('SUMMER');

  });

  grunt.task.registerMultiTask('letter', 'assigns config elements based off pdf file name', function(){

      this.files.forEach(function(file){

        var letter = file.src.toString();

        var prospect = letter.match(/([a-zA-Z]*),([a-zA-Z]*)(,.*)?.pdf/);

        function capitalize(s)
        {
            return s[0].toUpperCase() + s.slice(1);
        }

        grunt.config('settings.firstName', capitalize(prospect[2]));
        grunt.config('settings.lastName', capitalize(prospect[1]));

        if (prospect[3]){
          
          var opts = prospect[3].split(',');

          opts.forEach(function(op){
             // if (arg == "SP") grunt.task.run('copy:Health');
              
          switch(op){
    
            case  "SM1":
                grunt.config('settings.program', 'SUMMER');
                grunt.config('settings.session', 'SUMMER1');
              break;

            case "SM2":
                grunt.config('settings.program', 'SUMMER');
                grunt.config('settings.session', 'SUMMER2');
              break
    
            case 'INT':
                grunt.config('settings.citizenship', 'INT');
              break;
    
            case 'TRANS':
                grunt.config('settings.admitType', 'TRANS');
              break;
    
            case 'SP':
                grunt.config('settings.session', 'SPRING');
              break;
          }


          });          
        
        }else{
            grunt.log.warn('No arguments provided on pdf');          
        }
        
        

      });

  });

  grunt.registerTask('announce', 'displays the settings', function(){
      var first =     grunt.config('settings.firstName'),
          last =      grunt.config('settings.lastName'),
          program =   grunt.config('settings.program'),
          citizen =   grunt.config('settings.citizenship'),
          admitType = grunt.config('settings.admitType'),
          session =   grunt.config('settings.session');

      grunt.log.writeln(first + ' ' + last);
      grunt.log.writeln("Program: " + program);
      grunt.log.writeln("Citizenship: " + citizen);
      grunt.log.writeln("Admit-type: " + admitType);
      grunt.log.writeln("Session: " + session);
  });

};









