const main = () => {
  const searchParams = new URL(location.href).searchParams;
  const exercises = JSON.parse(searchParams.get("exercises") || "[]");
  document.getElementById(
    "root"
  ).innerHTML = `<training-player exercises='${JSON.stringify(
    exercises
  )}'></training-player>`;
};

main();
