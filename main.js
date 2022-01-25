let auth;

const registerServiceWorker = () => {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker
      .register(`/sw.js`, {
        scope: "/",
      })
      .then((registration) => {
        registration.addEventListener("updatefound", () => {
          registration.active.postMessage("SKIP_WAITING");
        });
      });
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      window.location.reload();
    });
  }
};

const updateAuthStatus = () => {
  console.log(auth);
  const profile = auth.currentUser.get().getBasicProfile();
  console.log("profile=", profile);
  console.log("profile name=", profile.getName());
  console.log("profile email=", profile.getEmail());
};

const registerAuth = () => {
  if (!gapi) {
    console.warn("registerAuth() require gapi object!");
    return;
  }
  gapi.load("client", () => {
    gapi.client
      .init({
        apiKey: "AIzaSyA9OlrZ5KxkwEMSba_p61OBr6LF-YkcKTA",
        clientId:
          "730132914202-l6dgndu9lf88c4g7u1ot5iiabkmfcln1.apps.googleusercontent.com",
        scope:
          "https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email",
      })
      .then(() => {
        auth = gapi.auth2.getAuthInstance();

        if (auth) {
          auth.isSignedIn.listen(updateAuthStatus);
        }
      });

    document.getElementById("sign-in").addEventListener("click", () => {
      auth.signIn();
    });
  });
};

const renderTrainings = ([trainings, exercises]) => {
  const content = trainings
    .map((training) => {
      const _exercises = training.exercises.split("\n").map((_exercise) => {
        const [name, sets, time] = _exercise.split(";");
        const { videoId, start, end, bells } = exercises.find(
          (item) => item.name === name
        );
        return {
          videoId,
          name,
          start: Number(start),
          end: Number(end),
          sets: Number(sets),
          time: Number(time),
          bells: bells
            .split(",")
            .filter(Boolean)
            .map((value) => Number(value)),
        };
      });
      return `
<details>
<summary>${training.name}</summary>
  <iframe
    src='player/index.html?exercises=${JSON.stringify(_exercises)}'
    width="100%"
    height="600"
  ></iframe>
</details>
    `;
    })
    .join("");
  document.getElementById("trainings").innerHTML = content;
};

const renderError = (error) => {
  console.error(error);
  document.getElementById("trainings").textContent = "Произошла ошибка.";
};

const addTrainingsExercisesListeners = () => {
  document.getElementById("trainings-exercises-data").addEventListener(
    "load",
    (event) => {
      renderTrainings(event.detail.values);
    },
    true
  );

  document.getElementById("trainings-exercises-data").addEventListener(
    "error",
    (event) => {
      renderError(event.detail.error);
    },
    true
  );
};

const addVideoClickListener = () => {
  // Check that browser supports dialog element
  if (!(typeof HTMLDialogElement === "function")) {
    return;
  }
  document.body.addEventListener("click", (event) => {
    const target = event.target.closest("a");
    if (target && target.href.startsWith("https://www.youtube.com/watch?v=")) {
      event.preventDefault();
      const dialog = document.getElementById("short-trainings-dialog");
      const [, videoId] = target.href.match(
        /^https:\/\/www\.youtube\.com\/watch\?v=(.+?)$/
      );
      dialog.innerHTML = `<iframe width="560" height="315" src="https://www.youtube.com/embed/${videoId}" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
      dialog.open = true;
    } else if (!event.target.closest("dialog")) {
      const dialog = document.getElementById("short-trainings-dialog");
      dialog.textContent = "";
      dialog.open = false;
    }
  });
};

const main = () => {
  addTrainingsExercisesListeners();
  addVideoClickListener();
  // registerAuth();
  // registerServiceWorker();
};

main();
