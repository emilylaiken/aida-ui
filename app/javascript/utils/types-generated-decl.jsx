/* @flow */

export type Bot = {
  id: number;
  name: string;
};

export type FacebookChannelConfig = {
  page_id: string;
  verify_token: string;
  access_token: string;
};

export type FrontDeskConfig = {
  greeting: Message;
  introduction: Message;
  not_understood: Message;
  clarification: Message;
  threshold: number;
};

export type LanguageDetectorConfig = {
  explanation: Message;
  languages: any;
};

export type KeywordResponderConfig = {
  explanation: Message;
  clarification: Message;
  keywords: any;
  responses: any;
};

export type Message = string;

export type Channel = {
  id: number;
  name: string;
  kind: "facebook";
  config: FacebookChannelConfig;
};

export type FrontDesk = {
  id: number;
  config: FrontDeskConfig;
};

export type Skill = {
  id: number;
  kind: "language_detector" | "keyword_responder";
  name: string;
  enabled: boolean;
  config: LanguageDetectorConfig | KeywordResponderConfig;
};

