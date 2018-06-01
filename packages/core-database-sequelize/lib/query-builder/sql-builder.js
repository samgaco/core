const { camelCase, upperFirst } = require('lodash')
const escape = require('./utils/escape')

class SqlBuilder {
  /**
   * Build the clauses.
   * @param  {Object} clauses
   * @return {String}
   */
  build (clauses) {
    return Object
      .keys(clauses)
      .map(key => this[`__build${upperFirst(camelCase(key))}`](clauses))
      .join('')
      .trim()
  }

  /**
   * Build the "SELECT" clause.
   * @param  {Object} clauses
   * @return {String}
   */
  __buildSelect (clauses) {
    const columns = clauses.select.columns
      .map(column => escape(column))

    const aggregates = clauses.select.aggregates
      .map(column => column)

    return `SELECT ${columns.concat(aggregates).join(',')} `
  }

  /**
   * Build the "FROM" clause.
   * @param  {Object} clauses
   * @return {String}
   */
  __buildFrom (clauses) {
    return `FROM ${escape(clauses.from)} `
  }

  /**
   * Build the "WHERE" clause.
   * @param  {Object} clauses
   * @return {String}
   */
  __buildWhere (clauses) {
    const map = (item) => {
      if (item.hasOwnProperty('from') && item.hasOwnProperty('to')) {
        return `${escape(item.column)} ${item.operator} ${escape(item.from)} AND ${escape(item.to)}`
      }

      return `${escape(item.column)} ${item.operator} ${escape(item.value, true)}`
    }

    const andQuery = Object
      .values(clauses.where.and)
      .map(item => map(item))
      .join(' AND ')

    const orQuery = Object
      .values(clauses.where.or)
      .map(item => map(item))
      .join(' OR ')

    if (!andQuery && !orQuery) {
      return ''
    }

    let query = 'WHERE '

    if (andQuery) {
      query += andQuery
    }

    if (orQuery) {
      query += ` OR ${orQuery}`
    }

    return `${query} `
  }

  /**
   * Build the "GROUP BY" clause.
   * @param  {Object} clauses
   * @return {String}
   */
  __buildGroupBy (clauses) {
    return `GROUP BY "${clauses.groupBy}" `
  }

  /**
   * Build the "ORDER BY" clause.
   * @param  {Object} clauses
   * @return {String}
   */
  __buildOrderBy (clauses) {
    const values = Object
      .values(clauses.orderBy)
      .map(item => `${escape(item.column)} ${item.direction.toUpperCase()}`)

    return `ORDER BY ${values.join(',')} `
  }

  /**
   * Build the "LIMIT" clause.
   * @param  {Object} clauses
   * @return {String}
   */
  __buildLimit (clauses) {
    return `LIMIT ${clauses.limit} `
  }

  /**
   * Build the "OFFSET" clause.
   * @param  {Object} clauses
   * @return {String}
   */
  __buildOffset (clauses) {
    return `OFFSET ${clauses.offset} `
  }
}

module.exports = new SqlBuilder()
