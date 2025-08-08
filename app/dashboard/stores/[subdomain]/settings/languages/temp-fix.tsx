// This is the editor tab content
        {activeTab === 'editor' && (
          <div className="nuvi-space-y-lg">
            {/* Content Type Selector */}
            <div className="nuvi-card">
              <div className="nuvi-card-header">
                <h3 className="nuvi-card-title">Translation Editor</h3>
                <p className="nuvi-text-sm nuvi-text-muted">
                  Directly edit translations for your content
                </p>
              </div>
              <div className="nuvi-card-content">
                <div className="nuvi-flex nuvi-items-center nuvi-gap-md">
                  <select
                    value={selectedContentType}
                    onChange={(e) => {
                      setSelectedContentType(e.target.value as any);
                      setSelectedContent(null);
                      setContentList([]);
                    }}
                    className="nuvi-select"
                  >
                    <option value="product">Products</option>
                    <option value="category">Categories</option>
                    <option value="page">Pages</option>
                    <option value="blogPost">Blog Posts</option>
                  </select>

                  <button
                    onClick={loadContent}
                    disabled={loadingContent}
                    className="nuvi-btn nuvi-btn-secondary"
                  >
                    {loadingContent ? 'Loading...' : 'Load Content'}
                  </button>

                  {/* Language Selectors */}
                  <div className="nuvi-ml-auto nuvi-flex nuvi-items-center nuvi-gap-sm">
                    <select
                      value={sourceLanguage}
                      onChange={(e) => setSourceLanguage(e.target.value)}
                      className="nuvi-select"
                    >
                      {languageSettings?.enabledLanguages?.map((lang: string) => (
                        <option key={lang} value={lang}>{lang.toUpperCase()}</option>
                      ))}
                    </select>
                    <span className="nuvi-text-muted">→</span>
                    <select
                      value={targetLanguage}
                      onChange={(e) => setTargetLanguage(e.target.value)}
                      className="nuvi-select"
                    >
                      {languageSettings?.enabledLanguages?.filter((lang: string) => lang !== sourceLanguage).map((lang: string) => (
                        <option key={lang} value={lang}>{lang.toUpperCase()}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Editor Content */}
            <div className="nuvi-card">
              <div className="nuvi-card-content nuvi-p-0">
                <div className="nuvi-flex nuvi-h-[600px]">
                  {/* Content List */}
                  <div className="nuvi-w-1/3 nuvi-border-r nuvi-overflow-y-auto nuvi-p-md">
                    <div className="nuvi-space-y-sm">
                      {contentList.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => {
                            setSelectedContent(item);
                            loadContentTranslations(item.id);
                          }}
                          className={`nuvi-w-full nuvi-text-left nuvi-p-sm nuvi-rounded-lg nuvi-border nuvi-transition-colors ${
                            selectedContent?.id === item.id
                              ? 'nuvi-bg-primary/10 nuvi-border-primary'
                              : 'nuvi-hover:bg-gray-50 nuvi-border-gray-200'
                          }`}
                        >
                          <div className="nuvi-font-medium">{item.name || item.title}</div>
                          {item.slug && (
                            <div className="nuvi-text-sm nuvi-text-muted nuvi-mt-xs">/{item.slug}</div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Translation Fields */}
                  <div className="nuvi-flex-1 nuvi-overflow-y-auto nuvi-p-lg">
                    {selectedContent ? (
                      <div className="nuvi-space-y-lg">
                        {/* Title/Name Field */}
                        <div className="nuvi-space-y-sm">
                          <label className="nuvi-label">
                            {selectedContentType === 'product' || selectedContentType === 'category' ? 'Name' : 'Title'}
                          </label>
                          <div className="nuvi-grid nuvi-grid-cols-2 nuvi-gap-md">
                            <div>
                              <div className="nuvi-text-xs nuvi-text-muted nuvi-mb-xs">{sourceLanguage.toUpperCase()}</div>
                              <input
                                type="text"
                                value={selectedContent.name || selectedContent.title}
                                readOnly
                                className="nuvi-input nuvi-bg-gray-50"
                              />
                            </div>
                            <div>
                              <div className="nuvi-text-xs nuvi-text-muted nuvi-mb-xs">{targetLanguage.toUpperCase()}</div>
                              <div className="nuvi-flex nuvi-gap-sm">
                                <input
                                  type="text"
                                  value={contentTranslations[targetLanguage]?.name || contentTranslations[targetLanguage]?.title || ''}
                                  onChange={(e) => {
                                    setContentTranslations({
                                      ...contentTranslations,
                                      [targetLanguage]: {
                                        ...contentTranslations[targetLanguage],
                                        [selectedContentType === 'product' || selectedContentType === 'category' ? 'name' : 'title']: e.target.value
                                      }
                                    });
                                  }}
                                  className="nuvi-input nuvi-flex-1"
                                  placeholder="Enter translation..."
                                />
                                <button
                                  onClick={() => saveContentTranslation(
                                    selectedContentType === 'product' || selectedContentType === 'category' ? 'name' : 'title',
                                    contentTranslations[targetLanguage]?.[selectedContentType === 'product' || selectedContentType === 'category' ? 'name' : 'title'] || ''
                                  )}
                                  disabled={savingTranslation}
                                  className="nuvi-btn nuvi-btn-success nuvi-btn-sm"
                                >
                                  <Save className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Description/Content Field */}
                        {(selectedContent.description || selectedContent.content) && (
                          <div className="nuvi-space-y-sm">
                            <label className="nuvi-label">
                              {selectedContentType === 'page' || selectedContentType === 'blogPost' ? 'Content' : 'Description'}
                            </label>
                            <div className="nuvi-grid nuvi-grid-cols-2 nuvi-gap-md">
                              <div>
                                <div className="nuvi-text-xs nuvi-text-muted nuvi-mb-xs">{sourceLanguage.toUpperCase()}</div>
                                <textarea
                                  value={selectedContent.description || selectedContent.content}
                                  readOnly
                                  rows={6}
                                  className="nuvi-textarea nuvi-bg-gray-50"
                                />
                              </div>
                              <div>
                                <div className="nuvi-text-xs nuvi-text-muted nuvi-mb-xs">{targetLanguage.toUpperCase()}</div>
                                <div className="nuvi-flex nuvi-gap-sm">
                                  <textarea
                                    value={contentTranslations[targetLanguage]?.description || contentTranslations[targetLanguage]?.content || ''}
                                    onChange={(e) => {
                                      setContentTranslations({
                                        ...contentTranslations,
                                        [targetLanguage]: {
                                          ...contentTranslations[targetLanguage],
                                          [selectedContentType === 'page' || selectedContentType === 'blogPost' ? 'content' : 'description']: e.target.value
                                        }
                                      });
                                    }}
                                    rows={6}
                                    className="nuvi-textarea nuvi-flex-1"
                                    placeholder="Enter translation..."
                                  />
                                  <button
                                    onClick={() => saveContentTranslation(
                                      selectedContentType === 'page' || selectedContentType === 'blogPost' ? 'content' : 'description',
                                      contentTranslations[targetLanguage]?.[selectedContentType === 'page' || selectedContentType === 'blogPost' ? 'content' : 'description'] || ''
                                    )}
                                    disabled={savingTranslation}
                                    className="nuvi-btn nuvi-btn-success nuvi-btn-sm"
                                  >
                                    <Save className="h-4 w-4" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* SEO Fields */}
                        {(selectedContent.metaTitle || selectedContent.seoTitle) && (
                          <>
                            <div className="nuvi-space-y-sm">
                              <label className="nuvi-label">SEO Title</label>
                              <div className="nuvi-grid nuvi-grid-cols-2 nuvi-gap-md">
                                <div>
                                  <div className="nuvi-text-xs nuvi-text-muted nuvi-mb-xs">{sourceLanguage.toUpperCase()}</div>
                                  <input
                                    type="text"
                                    value={selectedContent.metaTitle || selectedContent.seoTitle || ''}
                                    readOnly
                                    className="nuvi-input nuvi-bg-gray-50"
                                  />
                                </div>
                                <div>
                                  <div className="nuvi-text-xs nuvi-text-muted nuvi-mb-xs">{targetLanguage.toUpperCase()}</div>
                                  <div className="nuvi-flex nuvi-gap-sm">
                                    <input
                                      type="text"
                                      value={contentTranslations[targetLanguage]?.metaTitle || contentTranslations[targetLanguage]?.seoTitle || ''}
                                      onChange={(e) => {
                                        setContentTranslations({
                                          ...contentTranslations,
                                          [targetLanguage]: {
                                            ...contentTranslations[targetLanguage],
                                            [selectedContentType === 'product' ? 'metaTitle' : 'seoTitle']: e.target.value
                                          }
                                        });
                                      }}
                                      className="nuvi-input nuvi-flex-1"
                                      placeholder="Enter translation..."
                                    />
                                    <button
                                      onClick={() => saveContentTranslation(
                                        selectedContentType === 'product' ? 'metaTitle' : 'seoTitle',
                                        contentTranslations[targetLanguage]?.[selectedContentType === 'product' ? 'metaTitle' : 'seoTitle'] || ''
                                      )}
                                      disabled={savingTranslation}
                                      className="nuvi-btn nuvi-btn-success nuvi-btn-sm"
                                    >
                                      <Save className="h-4 w-4" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="nuvi-space-y-sm">
                              <label className="nuvi-label">SEO Description</label>
                              <div className="nuvi-grid nuvi-grid-cols-2 nuvi-gap-md">
                                <div>
                                  <div className="nuvi-text-xs nuvi-text-muted nuvi-mb-xs">{sourceLanguage.toUpperCase()}</div>
                                  <textarea
                                    value={selectedContent.metaDescription || selectedContent.seoDescription || ''}
                                    readOnly
                                    rows={3}
                                    className="nuvi-textarea nuvi-bg-gray-50"
                                  />
                                </div>
                                <div>
                                  <div className="nuvi-text-xs nuvi-text-muted nuvi-mb-xs">{targetLanguage.toUpperCase()}</div>
                                  <div className="nuvi-flex nuvi-gap-sm">
                                    <textarea
                                      value={contentTranslations[targetLanguage]?.metaDescription || contentTranslations[targetLanguage]?.seoDescription || ''}
                                      onChange={(e) => {
                                        setContentTranslations({
                                          ...contentTranslations,
                                          [targetLanguage]: {
                                            ...contentTranslations[targetLanguage],
                                            [selectedContentType === 'product' ? 'metaDescription' : 'seoDescription']: e.target.value
                                          }
                                        });
                                      }}
                                      rows={3}
                                      className="nuvi-textarea nuvi-flex-1"
                                      placeholder="Enter translation..."
                                    />
                                    <button
                                      onClick={() => saveContentTranslation(
                                        selectedContentType === 'product' ? 'metaDescription' : 'seoDescription',
                                        contentTranslations[targetLanguage]?.[selectedContentType === 'product' ? 'metaDescription' : 'seoDescription'] || ''
                                      )}
                                      disabled={savingTranslation}
                                      className="nuvi-btn nuvi-btn-success nuvi-btn-sm"
                                    >
                                      <Save className="h-4 w-4" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    ) : (
                      <div className="nuvi-text-center nuvi-text-muted nuvi-mt-20">
                        Select a {selectedContentType} to translate
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}