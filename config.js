function banner (pkg) {
  return `${pkg.name} - @version ${pkg.version}

Copyright (C) 2019 The Trustees of Indiana University
SPDX-License-Identifier: BSD-3-Clause`
}

module.exports.banner = banner
