const API_KEY = process.env.REACT_APP_RAPIDAPI_KEY;
const API_HOST = process.env.REACT_APP_RAPIDAPI_HOST;

export async function runCodeWithJudge0({ source_code, language_id, stdin = "" }) {
  const submitRes = await fetch("https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=false&wait=false", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "X-RapidAPI-Key": API_KEY,
      "X-RapidAPI-Host": API_HOST,
    },
    body: JSON.stringify({ source_code, language_id, stdin }),
  });

  const { token } = await submitRes.json();

  let result = null;

  while (!result || (result.status && result.status.id <= 2)) {
    const res = await fetch(`https://judge0-ce.p.rapidapi.com/submissions/${token}?base64_encoded=false`, {
      headers: {
        "X-RapidAPI-Key": API_KEY,
        "X-RapidAPI-Host": API_HOST,
      },
    });
    result = await res.json();
    if (!result.status) break;
    if (result.status.id > 2) break;

    await new Promise((r) => setTimeout(r, 1000));
  }

  return result;
}
