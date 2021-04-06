window.addEventListener('load', function () {
  // helper
  const sleep = (ms) => { return new Promise((resolve) => { setTimeout(resolve, ms); }); }

  // consts
  const burgers = document.querySelector('.burgers');
  const sidebar = document.querySelector('.sidebar');
  const frontPage = document.querySelector('#frontpage');
  const commandsPage = document.querySelector('#commandspage');
  const commandsBtn = document.querySelector('#link-commands');
  const commandsBtnMobile = document.querySelector('#link-commands-mobile');

  // sidebar toggle
  let menuOpen = false;
  burgers.addEventListener('click', () => {
    if (menuOpen) {
      burgers.classList.remove('toggle');
      sidebar.classList.remove('open');
      menuOpen = false;
    } else {
      burgers.classList.add('toggle');
      sidebar.classList.add('open');
      menuOpen = true;
    }
  });

  // commandPage toggle
  let commandOpen = false;
  const toggleView = () => {
    if (commandOpen) {
      frontPage.style.display = 'flex';
      commandsPage.style.display = 'none';
      commandOpen = false;
    } else {
      frontPage.style.display = 'none';
      commandsPage.style.display = 'flex';
      commandOpen = true;
    }
    if (menuOpen) {
      burgers.classList.remove('toggle');
      sidebar.classList.remove('open');
      menuOpen = false;
    }
    commandsBtn.classList.toggle('active');
    commandsBtnMobile.classList.toggle('active');
  }
  commandsBtn.addEventListener('click', toggleView);
  commandsBtnMobile.addEventListener('click', toggleView);

  // commandPage command toggle
  let command = null;
  let commandChild = null;
  let commandMarker = null;
  let commandHeightMin = null;
  let commandHeightMax = null;
  let test = document.querySelector('#cmd-join');

  const collapseCommand = (el) => {
    el.style.height = commandHeightMin + 'px';
  };

  const expandCommand = (el) => {
    let txt = el.querySelector('h4');
    commandHeightMin = txt.scrollHeight;
    commandHeightMax = el.scrollHeight - 40;
    if (!el.style.height) {
      el.style.height = commandHeightMin + 'px';
      requestAnimationFrame(() => {
        el.style.height = commandHeightMax + 'px';
      });
    } else {
      el.style.height = commandHeightMax + 'px';
    }
  };

  const commandHandler = async (e) => {
    if (!commandOpen) return;

    for (let i = 0; i < 3; i++) {
      if (e.path[i].classList.contains('command')) {
        if (command) {
          test.style.backgroundColor = 'red';
          collapseCommand(command);
          test.style.backgroundColor = 'green';
          commandMarker.classList.remove('active');
          await sleep(200);
          commandChild.style.display = 'none';
          if (command == e.path[i]) {
            command = commandChild = commandMarker = null;
            return;
          }
        }
        command = e.path[i];
        for (const child of command.children) {
          if (child.classList.contains('command-content')) {
            commandChild = child;
            commandChild.style.display = 'block';
          }
        }
        test.style.backgroundColor = 'blue';
        expandCommand(command);
        test.style.backgroundColor = 'yellow';
        commandMarker = command.querySelector('.marker')
        commandMarker.classList.add('active');
        break;
      }
      test.style.backgroundColor = 'purple';
    }
    test.style.backgroundColor = 'orange';

  };

  let mobileDevice = /Android|webOS|iPhone|iPad|Mac|Macintosh|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || false;
  /* document.addEventListener('click', commandHandler); */
  [
    document.querySelector('#cmd-join'),
    document.querySelector('#cmd-leave'),
    document.querySelector('#cmd-play'),
    document.querySelector('#cmd-playnext'),
    document.querySelector('#cmd-stop'),
    document.querySelector('#cmd-pause'),
    document.querySelector('#cmd-resume'),
    document.querySelector('#cmd-skip'),
    document.querySelector('#cmd-remove'),
    document.querySelector('#cmd-clear'),
    document.querySelector('#cmd-repeat'),
    document.querySelector('#cmd-volume'),
    document.querySelector('#cmd-save'),
    document.querySelector('#cmd-load')
  ].forEach(el => {
    el.addEventListener('click', commandHandler);
  })

});