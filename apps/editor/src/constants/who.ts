export const whoAwsConfigDevelopment = {
  aws_project_region: "eu-central-1",
  aws_cognito_region: "eu-central-1",
  aws_user_pools_id: "eu-central-1_1cFVgcU36",
  aws_user_pools_web_client_id: "6gefcom54rvc0pv25lfl8qmf06",
  oauth: {
    domain: "fg-ai4h.auth.eu-central-1.amazoncognito.com",
  },
};

export const whoAwsConfigDeployment = {
  aws_project_region: "eu-central-1",
  aws_cognito_region: "eu-central-1",
  aws_user_pools_id: "eu-central-1_1cFVgcU36",
  aws_user_pools_web_client_id: "3k9qjs36nfbd3dc62j2t8ttsgn",
  oauth: {
    domain: "fg-ai4h.auth.eu-central-1.amazoncognito.com",
  },
};

// eslint-disable-next-line @typescript-eslint/naming-convention
export const whoRequiresAuthentication = true;

export const whoHome = "https://www.ai4h.net/";
