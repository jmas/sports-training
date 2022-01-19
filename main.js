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

const fetchTable = (url, table) => {
  const newUrl = new URL(url);
  newUrl.searchParams.set("action", "getTable");
  newUrl.searchParams.set("table", table);
  return fetch(newUrl.toString())
    .then((response) => response.json())
    .then(formatTableData);
};

const fetchTrainings = (url) => {
  return fetchTable(url, "trainings");
};

const fetchExercises = (url) => {
  return fetchTable(url, "exercises");
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
  console.error(error);
  document.getElementById("trainings").innerHTML = "Произошла ошибка.";
};

const renderLoading = () => {
  document.getElementById("trainings").innerHTML = "Загрузка&hellip;";
};

const readFromCache = (key) => {
  const { value, expire } = JSON.parse(
    localStorage[key] || '{ "value": null, "expire": null }'
  );
  if (!expire) {
    return null;
  }
  if (new Date().getTime() < expire) {
    return value;
  } else {
    localStorage.removeItem(key);
  }
  return null;
};

const writeToCache = (key, value, ttl = 3600) => {
  localStorage[key] = JSON.stringify({
    value,
    expire: new Date().getTime() + ttl * 1000,
  });
  return value;
};

const queryOrGetFromCache = (key, queryFn, ttl = 3600) => {
  return new Promise((resolve) => {
    const cached = readFromCache(key);
    if (cached) {
      resolve(cached);
    } else {
      Promise.resolve(queryFn())
        .then((value) => {
          writeToCache(key, value, ttl);
          return value;
        })
        .then(resolve);
    }
  });
};

const main = () => {
  const apiUrl = getApiUrl();

  renderLoading();

  queryOrGetFromCache(
    "trainings_exercises_cache",
    () => Promise.all([fetchTrainings(apiUrl), fetchExercises(apiUrl)]),
    3600 * 12 // 12 hours
  )
    .then(renderTrainings)
    .catch(renderError);
};

main();
