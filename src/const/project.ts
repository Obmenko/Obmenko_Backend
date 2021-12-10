type EnvConfig = {
  TG_TOKEN?: string;
  PORT: string | number;
}

const PROJECT_CONFIG: EnvConfig =  {
  PORT: process.env.PORT || 8080,
  TG_TOKEN: process.env.TG_TOKEN
}

export default PROJECT_CONFIG;