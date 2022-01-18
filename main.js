const getApiUrl = () => {
  return document.body.dataset.api;
};

const formatTableData = ([header, body]) => {
  return body.map((item) => {
    return header.reduce((result, name, index) => {
      result[name] = item[index];
      return result;
    }, {});
  });
};

const fetchTrainings = (url) => {
  const newUrl = new URL(url);
  newUrl.searchParams.set("action", "getTable");
  newUrl.searchParams.set("table", "trainings");
  return fetch(newUrl.toString())
    .then((response) => response.json())
    .then(formatTableData);
};

const fetchExercises = (url) => {
  const newUrl = new URL(url);
  newUrl.searchParams.set("action", "getTable");
  newUrl.searchParams.set("table", "exercises");
  return fetch(newUrl.toString())
    .then((response) => response.json())
    .then(formatTableData);
};

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
  document.getElementById("trainings").innerHTML = "Произошла ошибка.";
};

const renderLoading = () => {
  document.getElementById("trainings").innerHTML = "Загрузка&hellip;";
};

const main = () => {
  const apiUrl = getApiUrl();

  renderLoading();

  Promise.all([fetchTrainings(apiUrl), fetchExercises(apiUrl)])
    .then(renderTrainings)
    .catch(renderError);
};

main();
