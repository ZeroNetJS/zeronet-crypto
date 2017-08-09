#!/usr/bin/env node

"use strict"

require("colors")

let node
let dwait = require("./lib/hacky-logs.js")

const fs = require("fs")
const path = require("path")
const mkdirp = require("mkdirp")

const MergeRecursive = require("merge-recursive")
const ZeroNet = require("zeronet-node")

const FS = require("zeronet-storage-fs")

const Common = require("zeronet-common/index.js")

let dir = require("./lib/storage-dir")()

mkdirp.sync(dir)
mkdirp.sync(path.join(dir, "logs"))

let cm

const defaults = {
  id_expire: 60 * 60 * 24 * 7 * 4, //approx 1 month
  swarm: {
    server: {
      host: "0.0.0.0",
      port: 15543
    },
    server6: {
      host: "::",
      port: 15543
    },
    protocol: {
      crypto: [
        require("zeronet-crypto/secio")
      ]
    }
  },
  uiserver: {
    listen: {
      host: "127.0.0.1",
      port: 15544
    }
  },
  node: {
    trackers: [
      //"zero://boot3rdez4rzn36x.onion:15441",
      //"zero://boot.zeronet.io#f36ca555bee6ba216b14d10f38c16f7769ff064e0e37d887603548cc2e64191d:15441",
      "udp://tracker.coppersurfer.tk:6969",
      "udp://tracker.leechers-paradise.org:6969",
      "udp://9.rarbg.com:2710",
      "http://tracker.opentrackr.org:1337/announce",
      "http://explodie.org:6969/announce",
      "http://tracker1.wasabii.com.tw:6969/announce"
      //"http://localhost:25534/announce"
    ],
    nat: true
  },
  common: cm = new Common({
    debug_file: path.resolve(dir, path.join("logs", "debug.log")),
    debug_shift_file: path.resolve(dir, path.join("logs", "debug-last.log")),
    debug: !!process.env.DEBUG
  }),
  storage: new FS(path.join(dir, "data"))
}

cm.logger("node")("Starting...")

const errCB = err => {
  if (!err && process.env.TESTOK) process.emit("SIGINT")
  if (!err) return node.logger("node")("Started successfully")
  cm.logger("node").fatal("The node failed to start")
  cm.logger("node").fatal(err)
  process.exit(2)
}

const confpath = path.resolve(dir, process.env.CONFIG_FILE || "config.json")
const idpath = path.resolve(dir, process.env.ID_FILE || "id.json")

const readJSON = path => JSON.parse(fs.readFileSync(path).toString())
const writeJSON = (path, data) => fs.writeFileSync(path, new Buffer(JSON.stringify(data)))

let config

if (fs.existsSync(confpath)) {
  const config_data = readJSON(confpath)
  config = MergeRecursive(defaults, config_data)
} else config = defaults

let exiting

function exit(code) {
  if (!node) {
    cm.logger("node").error("Stopping before started!")
    exiting = true;
    ["error", "warn"].forEach(k => console.error[k] = console.error)
    node = {
      logger: () => console.error
    }
    exit(2)
  }
  if (exiting) {
    node.logger("node").warn("Force stop!")
    return process.nextTick(() => process.exit(2))
  }
  exiting = true
  node.logger("node")("Stopping...")
  node.logger("node")("Press ^C to force stop")
  node.stop(err => {
    if (err) {
      cm.logger("node").error(err)
      cm.logger("node").error("FAILED TO QUIT GRACEFULLY")
      throw err
    }
    node.logger("node")("Stopped")
    process.exit(code || 0)
  })
}

if (!process.env.IGNORE_SIG)["SIGTERM", "SIGINT", "SIGUSR2"].forEach(sig => process.on(sig, exit))

const Id = require("peer-id")

const liftoff = (err, id) => {
  if (err) return errCB(err)
  config.id = id
  node = new ZeroNet(config)
  dwait.map(d => d())
  dwait = null
  node.start(errCB)
}

const createAndSaveID = () => {
  cm.logger("id")("Creating/Changing ID... This may take a few seconds...")
  Id.create((err, id) => {
    if (err) return errCB(err)
    cm.logger("id")("Created ID %s!", id.toB58String())
    id.created_at = new Date().getTime()
    try {
      writeJSON(idpath, id)
      liftoff(null, id)
    } catch (e) {
      liftoff(e)
    }
  })
}

try {
  if (fs.existsSync(idpath)) {
    const id = readJSON(idpath)
    if (id.created_at + config.id_expire < new Date().getTime()) {
      createAndSaveID()
    } else Id.createFromJSON(id, liftoff)
  } else createAndSaveID()
} catch (e) {
  liftoff(e)
}
