// Common component parameters
NAMESPACE = 'ee5243'
TOOLS_TAG = 'tools'
NAMESPACE_BUILD = "${NAMESPACE}"  + '-' + "${TOOLS_TAG}"
ROCKETCHAT_CHANNEL='#bcsc-ss-bot'
BUILD_PHASE = "build"
TEST_PHASE = "Test"
DEPLOYMENT_PHASE = "Deployment"
// Load Common Variables and utils
common = ""
node{
  common = load "../workspace@script/jenkins/jenkinsfile.common.groovy"
  ROCKETCHAT_TOKEN = sh (
                    script: """oc get secret/rocketchat-token-secret -n ${NAMESPACE_BUILD} -o template --template="{{.data.ROCKETCHAT_TOKEN}}" | base64 --decode""",
                        returnStdout: true).trim()
}

// Selfservice-UI Parameters
WEB_BUILD = common.WEB_NAME + "-build-" + common.web_environments.dev.tag
WEB_IMAGESTREAM_NAME = common.WEB_NAME + "-" + common.web_environments.dev.tag
WEB_NAME = common.WEB_NAME

// Selfservice-db parameters
DB_BUILD = common.DB_NAME + "-build"
DB_IMAGESTREAM_NAME = common.DB_NAME

// SelfService-Api parameters
API_BUILD = common.API_NAME + "-build-" + common.web_environments.dev.tag
API_IMAGESTREAM_NAME = common.API_NAME + "-" + common.web_environments.dev.tag
API_NAME = common.API_NAME


stage('Build ' + WEB_IMAGESTREAM_NAME) {
  node{
    openshift.withProject() {
    try{
        // Make sure the frontend build configs exist
        common.ensureBuildExists(WEB_BUILD,"openshift/selfservice-ui/web-build.yaml")
        // Build and verify the app
        common.buildAndVerify(WEB_BUILD)

        // Success UI-Build Notification
        common.successNotificaiton(ROCKETCHAT_TOKEN, WEB_IMAGESTREAM_NAME, BUILD_PHASE )

    }catch(error){
        //Failure UI Build Notification
        common.failureNotificaiton(ROCKETCHAT_TOKEN, WEB_IMAGESTREAM_NAME, BUILD_PHASE )
        throw error
    }
    }
  }
}

stage('Build ' + API_IMAGESTREAM_NAME) {
  node{
    openshift.withProject() {
      try{
        // Make sure the frontend build configs exist
        common.ensureBuildExists(API_IMAGESTREAM_NAME,"openshift/selfservice-api/api-build.yaml")
        // Build and verify the app
        common.buildAndVerify(API_BUILD)

        //Success DB-Build Notification
        common.successNotificaiton(ROCKETCHAT_TOKEN, API_IMAGESTREAM_NAME, BUILD_PHASE)
      }catch(error){
        // failure DB Build Notification
        common.failureNotificaiton(ROCKETCHAT_TOKEN, API_IMAGESTREAM_NAME, BUILD_PHASE )
        throw error
      }
    }
  }
}

// Deploying WEB to Dev
stage("Deploy" + WEB_IMAGESTREAM_NAME + "to ${common.web_environments.dev.name}") {
  def environment = common.web_environments.dev.tag
  def url = common.web_environments.dev.url
  node{
    try{
      // Tag the images for deployment based on the image's hash
      WEB_IMAGE_HASH = common.getLatestHash(WEB_IMAGESTREAM_NAME, environment)
      echo ">> WEB_IMAGE_HASH: ${WEB_IMAGE_HASH}"

      common.deployAndVerify(WEB_IMAGE_HASH,environment,WEB_NAME)

      // WEB Deployment Success notification
      common.successNotificaiton(ROCKETCHAT_TOKEN, WEB_NAME, DEPLOYMENT_PHASE )
    }catch(error){
      // Web Deployment Failure Notification
      common.failureNotificaiton(ROCKETCHAT_TOKEN, WEB_NAME, DEPLOYMENT_PHASE )
      throw error
    }
  }
}

// // Deploying DB to Dev
// stage("Deploy to" + DB_NAME + "${common.db_environments.dev.name}") {
//   def environment = common.db_environments.dev.tag
//   db_tag = "prod"
//   def url = common.db_environments.dev.url
//   node{
//     try{
//       // Tag the images for deployment based on the image's hash
//       DB_IMAGE_HASH = common.getLatestHash(DB_IMAGESTREAM_NAME, db_tag)
//       echo ">> DB_IMAGE_HASH: ${DB_IMAGE_HASH}"

//       common.deployAndVerify(DB_IMAGE_HASH,environment,DB_IMAGESTREAM_NAME)

//       // DB Deployment Success notification
//       common.successNotificaiton(ROCKETCHAT_TOKEN, DB_IMAGESTREAM_NAME, DEPLOYMENT_PHASE )
//     }catch(error){
//       // DB Deployment Failure notification
//       common.failureNotificaiton(ROCKETCHAT_TOKEN, DB_IMAGESTREAM_NAME, DEPLOYMENT_PHASE )
//       throw error
//     }
// }
// }

// Deploying API to Dev
stage("Deploy to" + API_NAME + "${common.api_environments.dev.name}") {
  def environment = common.api_environments.dev.tag
  def url = common.api_environments.dev.url
  node{
    try{
      // Tag the images for deployment based on the image's hash
      API_IMAGE_HASH = common.getLatestHash(API_IMAGESTREAM_NAME, environment)
      echo ">> API_IMAGE_HASH: ${API_IMAGE_HASH}"

      common.deployAndVerify(API_IMAGE_HASH,environment, API_NAME)

      // DB Deployment Success notification
      common.successNotificaiton(ROCKETCHAT_TOKEN, API_NAME, DEPLOYMENT_PHASE )
    }catch(error){
      // DB Deployment Failure notification
      common.failureNotificaiton(ROCKETCHAT_TOKEN, API_NAME, DEPLOYMENT_PHASE )
      throw error
    }
  }
}

// stage('Get a ZAP Pod') {
//   node('zap') {
//     stage('Scan Web Application') {
//       dir('/zap') {
//         def retVal = sh returnStatus: true, script: '/zap/zap-baseline.py -r baseline.html -t https://selfservice-dev.pathfinder.gov.bc.ca'
//         publishHTML([allowMissing: false, alwaysLinkToLastBuild: false, keepAll: true, reportDir: '/zap/wrk', reportFiles: 'baseline.html', reportName: 'ZAP Baseline Scan', reportTitles: 'ZAP Baseline Scan'])
//         echo "Return value is: ${retVal}"
//       }
//     }
//   }
// }
