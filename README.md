# canvas-client
## Introduction


This lib is used as a wrapper around api calls to [Canvas LMS](https://www.canvaslms.com/).

[API Reference](https://canvas.instructure.com/doc/api/enrollments.html#method.enrollments_api.index)

## Installation

### Requirements

NODE [v6.2.2](https://nodejs.org/en/blog/release/v6.2.2/) or higher.

### Install Process
`npm install`

### Configuration
```javascript
  const canvasClient = require('canvas-client');
  let options = {
    host: '',         // required
    clientId: '',     // required
    clientSecret: '', // required
    accessToken: '',  // required
    refreshToken: '', // required
    courseId: 4
  };
  // API calls returns promise
  canvasClient.courseEnrollments(options);
```
## Running Application/Code

### Running Locally

N/A

### Running in Production

N/A
## External Dependencies
All packages pulled in by the package.json file.

## Deployment

N/A

## Cronjobs
N/A

## Credits

**Original Author**

* [Sajjad Hossain](https://github.com/EnosisSajjad)
