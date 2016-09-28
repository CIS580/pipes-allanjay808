"use strict";

/**
  * @module exports the EntityManager class
  */
module.exports = exports = EntityManager;

// Singleton
// module.exports = exports = new EntityManager();

function EntityManager(callback) {
  this.callback = callback;
  this.resourcesToLoad = 0;
  this.images = {};
}

function onLoad(em) {
  em.resourcesToLoad--;
  if (em.resourcesToLoad == 0) em.callback();
}

EntityManager.prototype.addImage(url) {
  if (this.images[url]) return this.images[url];
  this.resourcesToLoad++;
  var self = this;
  this.images[url] = new Image();
  this.images[url].onLoad = function() {
    onLoad(self);
  }
}

EntityManager.prototype.addAudio = function(url) {
  if (this.audio[url])
}

EntityManager.prototype.loadAll = function() {
  var self = this;
  Object.keys(this.images).forEach(function(url) {
    self.iamges[url].url = url;
  });
}
