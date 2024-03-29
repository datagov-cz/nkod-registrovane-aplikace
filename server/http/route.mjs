import Fastify from "fastify";

import apiV1HandleRequest from "./api-v1-applications-for-dataset/api-v1-applications-for-dataset.mjs";

import createApplicationList from "./application-list/application-list-presenter.mjs";
import createApplicationDetail from "./application-detail/application-detail-presenter.mjs";
import createSuggestionList from "./suggestion-list/suggestion-list-presenter.mjs";
import createSuggestionDetail from "./suggestion-detail/suggestion-detail-presenter.mjs";
import createStatusHandlers from "./http-status-handlers/http-status-handlers.mjs";

import { createTemplateService } from "../service/template-service.mjs";
import { registerComponents } from "../component/index.mjs";

export function registerHttpRoutes(server, services) {
  const templateCs = createAndPreloadTemplateService("cs");
  const templateEn = createAndPreloadTemplateService("en");

  server.route({
    method: "GET",
    url: "/api/aplikace/v1/applications-for-datasets",
    handler: (request, reply) => apiV1HandleRequest(services, request, reply),
  });

  const httpStatusHandlers = createStatusHandlers([templateCs, templateEn]);
  const webServices = {
    ...services,
    "http": httpStatusHandlers,
  };

  const applicationListCs = createApplicationList(
    webServices, templateCs, ["cs", "en"]);
  registerHandler(server, applicationListCs);

  const applicationListEn = createApplicationList(
    webServices, templateEn, ["en", "cs"]);
  registerHandler(server, applicationListEn);

  const applicationDetailCs = createApplicationDetail(
    webServices, templateCs, ["cs", "en"]);
  registerHandler(server, applicationDetailCs);

  const applicationDetailEn = createApplicationDetail(
    webServices, templateEn, ["en", "cs"]);
  registerHandler(server, applicationDetailEn);

  const suggestionListCs = createSuggestionList(
    webServices, templateCs, ["cs", "en"]);
  registerHandler(server, suggestionListCs);

  const suggestionListEn = createSuggestionList(
    webServices, templateEn, ["en", "cs"]);
  registerHandler(server, suggestionListEn);

  const suggestionDetailCs = createSuggestionDetail(
    webServices, templateCs, ["cs", "en"]);
  registerHandler(server, suggestionDetailCs);

  const suggestionDetailEn = createSuggestionDetail(
    webServices, templateEn, ["en", "cs"]);
  registerHandler(server, suggestionDetailEn);

  server.route({
    method: "GET",
    url: "/",
    handler: (_, reply) => reply.redirect("/" + applicationListCs.path),
  });

  server.setErrorHandler(function (error, request, reply) {
    this.log.error(error);
    httpStatusHandlers.handlerError(reply);
  });

  server.setNotFoundHandler(function (request, reply) {
    httpStatusHandlers.handlePathNotFound(reply);
  });

}

function registerHandler(server, handler) {
  server.route({
    method: "GET",
    url: "/" + handler.path,
    handler: handler.handler,
  });
}

function createAndPreloadTemplateService(language) {
  const service = createTemplateService("./server/");
  registerComponents(service, language);
  return service;
}
