      …options,
      data: body,
      url: url.replace(
        /\/repos\/([^/]+)/,
        (_, match) => “/repos/“ + decodeURIComponent(match),
      ),
    };

    core.debug(`route: ${inspect(route)}`);
    core.debug(`parameters: ${inspect(parameters)}`);
    core.debug(`parsed request options: ${inspect(requestOptions)}`);

    const { status, headers, data } = await octokit.request(requestOptions);

    core.info(`< ${status} ${Date.now() - time}ms`);

    core.setOutput(“status”, status);
    core.setOutput(“headers”, JSON.stringify(headers, null, 2));
    core.setOutput(
      “data”,
      typeof data === “object” ? JSON.stringify(data, null, 2) : data,
    );
  } catch (error) {
    if (error.status) {
      core.info(`< ${error.status} ${Date.now() - time}ms`);
    }

    core.setOutput(“status”, error.status);
    core.debug(inspect(error));
    core.setFailed(error.message);
  }
}

function getAllInputs() {
  return Object.entries(process.env).reduce((result, [key, value]) => {
    if (!/^INPUT_/.test(key)) return result;

    const inputName =
      key.toLowerCase() === “input_mediatype”
        ? “mediaType”
        : key.substr(“INPUT_”.length).toLowerCase();
    result[inputName] = yaml.load(value);

    return result;
  }, {});
}
