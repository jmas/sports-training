const renderTrainings = ([trainings, exercises]) => {
  const content = trainings
    .map((training) => {
      const _exercises = training.exercises.split("\n").map((_exercise) => {
        const [name, sets, time] = _exercise.split(";");
        const { videoId, start, end } = exercises.find(
          (item) => item.name === name
        );
        return {
          videoId,
          name,
          start: Number(start),
          end: Number(end),
          sets: Number(sets),
          time: Number(time),
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

const renderLoading = () => {
  document.getElementById("trainings").textContent = "Загрузка...";
};

const main = () => {
  renderLoading();

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

main();
