path = 'app/admin/categories/sync/page.jsx'

with open(path) as f:
    content = f.read()

old_block = """            <div className="overflow-hidden rounded-lg border border-outline-variant">
              {loading ? <LoadingState /> : filteredCategories.length ? (
                <div className="divide-y divide-outline-variant">
                  {visibleCategories.map((category) => <CategoryRow key={categoryKey(category)} category={category} checked={selected.has(categoryKey(category))} onToggle={() => toggleCategory(category)} />)}
                  <div className="flex flex-col gap-3 border-t border-outline-variant px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-xs text-on-surface-variant">Showing {(page - 1) * PAGE_SIZE + 1}-{Math.min(page * PAGE_SIZE, filteredCategories.length)} of {filteredCategories.length} categories</p>
                    <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
                  </div>
                </div>
              ) : <EmptyState hasSearch={Boolean(search.trim())} discovering={discovering} filteredCategories={filteredCategories} />}
            </div>
          </div>
      </Card>"""

new_block = """            <div className="overflow-hidden rounded-lg border border-outline-variant">
              {loading ? (
                <LoadingState />
              ) : discovering ? (
                <>
                  {filteredCategories.length > 0 ? (
                    <>
                      <div className="divide-y divide-outline-variant">
                        {visibleCategories.map((category) => (
                          <CategoryRow
                            key={categoryKey(category)}
                            category={category}
                            checked={selected.has(categoryKey(category))}
                            onToggle={() => toggleCategory(category)}
                          />
                        ))}
                        <div className="flex flex-col gap-3 border-t border-outline-variant px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                          <p className="text-xs text-on-surface-variant">
                            Showing {(page - 1) * PAGE_SIZE + 1}-{Math.min(page * PAGE_SIZE, filteredCategories.length)} of {filteredCategories.length} categories
                          </p>
                          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
                        </div>
                      </div>
                      <div className="mt-3 h-2 overflow-hidden rounded-full bg-primary/15">
                        <div className="h-full rounded-full bg-primary transition-all duration-300" style={{ width: `${progressPercent}%` }} />
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <Loader2 className="size-5 animate-spin text-on-surface-variant" />
                        <span className="text-body-sm font-semibold text-on-surface">Discovering new categories from Ingram...</span>
                      </div>
                      <p className="text-meta text-on-surface-variant">
                        Fetching the latest catalog from Ingram. This can take a moment for larger catalogs.
                      </p>
                    </div>
                  )}
                </>
              ) : filteredCategories.length ? (
                <div className="divide-y divide-outline-variant">
                  {visibleCategories.map((category) => (
                    <CategoryRow
                      key={categoryKey(category)}
                      category={category}
                      checked={selected.has(categoryKey(category))}
                      onToggle={() => toggleCategory(category)}
                    />
                  ))}
                  <div className="flex flex-col gap-3 border-t border-outline-variant px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-xs text-on-surface-variant">
                      Showing {(page - 1) * PAGE_SIZE + 1}-{Math.min(page * PAGE_SIZE, filteredCategories.length)} of {filteredCategories.length} categories
                    </p>
                    <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
                  </div>
                </div>
              ) : (
                <EmptyState hasSearch={Boolean(search.trim())} discovering={discovering} filteredCategories={filteredCategories} />
              )}
            </div>
          </div>
      </Card>"""

if old_block in content:
    content = content.replace(old_block, new_block)
    with open(path, 'w') as f:
        f.write(content)
    print('REPLACED SUCCESSFULLY')
else:
    print('NOT FOUND')
    # Find a snippet near the issue
    lines = content.split('\n')
    for i, line in enumerate(lines[174:191], start=175):
        print(f'{i}: {repr(line)}')
