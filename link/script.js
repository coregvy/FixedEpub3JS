// script.js
document.addEventListener('DOMContentLoaded', () => {
    const linkContainer = document.getElementById('link-container');
    const exportButton = document.getElementById('export-button');
    const importInput = document.getElementById('import-input');

    const addCategoryButton = document.getElementById('add-category-button');
    const addCategoryDialog = document.getElementById('add-category-dialog');
    const addCategoryForm = document.getElementById('add-category-form');
    const newCategoryNameInput = document.getElementById('new-category-name');
    const cancelAddCategoryButton = document.getElementById('cancel-add-category');

    const addLinkDialog = document.getElementById('add-link-dialog');
    const addLinkForm = document.getElementById('add-link-form');
    const linkCategoryNameInput = document.getElementById('link-category-name');
    const linkNameInput = document.getElementById('link-name');
    const linkUrlInput = document.getElementById('link-url');
    const linkIconInput = document.getElementById('link-icon');
    const cancelAddLinkButton = document.getElementById('cancel-add-link');

    const deleteDialog = document.getElementById('delete-dialog');
    const deleteMessage = document.getElementById('delete-message');
    const confirmDeleteButton = document.getElementById('confirm-delete');
    const cancelDeleteButton = document.getElementById('cancel-delete');

    // ローカルストレージキー
    const STORAGE_KEY = 'myLinksData';
    const LOG_KEY = 'linkClickLog'; // ログ専用のストレージキー

    // リンクデータをローカルストレージから取得または初期化
    function getLinks() {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : [
            { "category": "news", "link": [{ "name": "Google ニュース", "url": "https://news.google.com/", "icon": "fa-newspaper" }, { "name": "BBC News", "url": "https://www.bbc.com/news", "icon": "ri-global-line" }] },
            { "category": "shopping", "link": [{ "name": "Amazon", "url": "https://amazon.com/", "icon": "ri-shopping-cart-fill" }, { "name": "楽天", "url": "https://rakuten.com/", "icon": "fa-truck" }] }
        ];
    }

    // リンクデータをローカルストレージに保存
    function saveLinks(data) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        renderLinks(data);
    }

    // ログデータをローカルストレージから取得
    function getLogs() {
        const data = localStorage.getItem(LOG_KEY);
        return data ? JSON.parse(data) : [];
    }

    // ログデータを保存・最新10件に制限
    function saveLogs(logs) {
        // 最新の10件に制限して保存
        const limitedLogs = logs.slice(0, 10);
        localStorage.setItem(LOG_KEY, JSON.stringify(limitedLogs));
    }

    // リンククリック時にログを記録
    function logLinkClick(linkName) {
        const now = new Date();
        // hh:mm 形式の時刻をフォーマット
        const time = now.getHours().toString().padStart(2, '0') + ':' +
            now.getMinutes().toString().padStart(2, '0');

        const newLogEntry = `${time} ${linkName}`;
        const logs = getLogs();

        // 新しいエントリを配列の先頭に追加
        logs.unshift(newLogEntry);

        saveLogs(logs);

        // ログセクションを再描画して即座に反映
        renderLogsSection(logs);
    }

    // ログセクション専用のレンダリング関数
    function renderLogsSection(logs) {
        const logsSection = document.getElementById('logs-section');
        if (!logsSection) return; // セクションがなければ何もしない

        const logList = logsSection.querySelector('.log-list');
        if (logList) {
            logList.innerHTML = '';
            logs.forEach(log => {
                const li = document.createElement('li');
                li.textContent = log;
                li.classList.add('log-item');
                logList.appendChild(li);
            });
        }
    }

    // リンク一覧のレンダリング
    function renderLinks(categories) {
        linkContainer.innerHTML = '';

        categories.forEach((categoryData, index) => {
            const section = document.createElement('div');
            section.classList.add('category-section');

            const title = document.createElement('h2');
            title.classList.add('category-title');

            // 1番目のカテゴリ
            if (index === 0) {
                // ログセクション
                const logsSection = document.createElement('div');
                logsSection.classList.add('category-section');
                const logTitle = document.createElement('h2');
                logTitle.classList.add('category-title');
                logsSection.id = 'logs-section';
                logTitle.innerHTML = `<span>最近のアクセス</span>`;

                const logs = getLogs();
                const logList = document.createElement('ul');
                logList.classList.add('log-list');

                // 初回描画
                logs.forEach(log => {
                    const li = document.createElement('li');
                    li.textContent = log;
                    li.classList.add('log-item');
                    logList.appendChild(li);
                });
                logsSection.appendChild(logTitle);
                logsSection.appendChild(logList);
                linkContainer.appendChild(logsSection);
            }
            // 通常のカテゴリ
            title.innerHTML = `<span>${categoryData.category.toUpperCase()}</span>`;

            const categoryControls = document.createElement('span');
            categoryControls.classList.add('category-controls');
            categoryControls.innerHTML = `
                <button class="add-link-button" data-category="${categoryData.category}" title="リンクを追加"><i class="fa-solid fa-plus"></i></button>
                <button class="delete-category-button" data-category="${categoryData.category}" title="カテゴリを削除"><i class="fa-solid fa-trash-can"></i></button>
            `;
            title.appendChild(categoryControls);
            section.appendChild(title);

            categoryData.link.forEach(linkItem => {
                const linkWrapper = document.createElement('a');
                linkWrapper.href = linkItem.url;
                linkWrapper.classList.add('link-card');
                // linkWrapper.target = '_blank';

                // クリックイベントをキャッチしてログを記録
                linkWrapper.addEventListener('click', () => {
                    logLinkClick(linkItem.name);
                });

                const linkContent = document.createElement('div');
                linkContent.classList.add('link-card-content');

                const icon = document.createElement('i');
                const [prefix, ...iconName] = linkItem.icon.split('-');
                if (prefix === 'fa') {
                    icon.classList.add('fa-solid', ...linkItem.icon.split(' '));
                } else if (prefix === 'ri') {
                    icon.classList.add(linkItem.icon);
                }

                const linkText = document.createTextNode(linkItem.name);

                linkContent.appendChild(icon);
                linkContent.appendChild(linkText);
                linkWrapper.appendChild(linkContent);

                const deleteLinkButton = document.createElement('button');
                deleteLinkButton.classList.add('delete-link-button');
                deleteLinkButton.title = "リンクを削除";
                deleteLinkButton.dataset.category = categoryData.category;
                deleteLinkButton.dataset.linkName = linkItem.name;
                deleteLinkButton.innerHTML = `<i class="fa-solid fa-xmark"></i>`;
                linkWrapper.appendChild(deleteLinkButton);

                section.appendChild(linkWrapper);
            });
            

            linkContainer.appendChild(section);
        });
        // 描画後にイベントリスナーを再設定
        addEventListeners();
    }

    // イベントリスナーの一括設定
    function addEventListeners() {
        // リンク削除ボタン
        document.querySelectorAll('.delete-link-button').forEach(button => {
            button.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                const categoryName = button.dataset.category;
                const linkName = button.dataset.linkName;
                showDeleteDialog(`リンク "${linkName}" を削除してもよろしいですか？`, () => {
                    deleteLink(categoryName, linkName);
                });
            };
        });

        // カテゴリ削除ボタン
        document.querySelectorAll('.delete-category-button').forEach(button => {
            button.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                const categoryName = button.dataset.category;
                showDeleteDialog(`カテゴリ "${categoryName}" を削除してもよろしいですか？`, () => {
                    deleteCategory(categoryName);
                });
            };
        });

        // リンク追加ボタン
        document.querySelectorAll('.add-link-button').forEach(button => {
            button.onclick = (e) => {
                const categoryName = button.dataset.category;
                showAddLinkDialog(categoryName);
            };
        });
    }

    // ダイアログ表示・非表示関数
    function showDialog(dialog) { dialog.style.display = 'flex'; }
    function hideDialog(dialog) { dialog.style.display = 'none'; }

    // 削除確認ダイアログ
    function showDeleteDialog(message, onConfirm) {
        deleteMessage.textContent = message;
        showDialog(deleteDialog);
        confirmDeleteButton.onclick = () => {
            onConfirm();
            hideDialog(deleteDialog);
        };
        cancelDeleteButton.onclick = () => {
            hideDialog(deleteDialog);
        };
    }

    // リンク追加ダイアログ
    function showAddLinkDialog(categoryName) {
        linkCategoryNameInput.value = categoryName;
        linkNameInput.value = '';
        linkUrlInput.value = '';
        linkIconInput.value = '';
        showDialog(addLinkDialog);
    }
    addLinkForm.onsubmit = (e) => {
        e.preventDefault();
        const categoryName = linkCategoryNameInput.value;
        const linkName = linkNameInput.value;
        const linkUrl = linkUrlInput.value;
        const linkIcon = linkIconInput.value;
        addLink(categoryName, linkName, linkUrl, linkIcon);
        hideDialog(addLinkDialog);
    };
    cancelAddLinkButton.onclick = () => hideDialog(addLinkDialog);

    // カテゴリ追加ダイアログ
    addCategoryButton.onclick = () => showDialog(addCategoryDialog);
    addCategoryForm.onsubmit = (e) => {
        e.preventDefault();
        const newCategoryName = newCategoryNameInput.value;
        addCategory(newCategoryName);
        hideDialog(addCategoryDialog);
    };
    cancelAddCategoryButton.onclick = () => hideDialog(addCategoryDialog);

    // データ操作関数
    function addCategory(categoryName) {
        const links = getLinks();
        if (links.find(c => c.category === categoryName)) {
            alert('そのカテゴリは既に存在します。');
            return;
        }
        links.push({ category: categoryName, link: [] });
        saveLinks(links);
    }

    function deleteCategory(categoryName) {
        const links = getLinks();
        const newLinks = links.filter(c => c.category !== categoryName);
        saveLinks(newLinks);
    }

    function addLink(categoryName, linkName, linkUrl, linkIcon) {
        const links = getLinks();
        const category = links.find(c => c.category === categoryName);
        if (category) {
            category.link.push({ name: linkName, url: linkUrl, icon: linkIcon });
            saveLinks(links);
        }
    }

    function deleteLink(categoryName, linkName) {
        const links = getLinks();
        const category = links.find(c => c.category === categoryName);
        if (category) {
            category.link = category.link.filter(l => l.name !== linkName);
            saveLinks(links);
        }
    }

    // エクスポート機能
    exportButton.addEventListener('click', () => {
        const data = getLinks();
        const json = JSON.stringify(data, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'my-links.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });

    // インポート機能
    importInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importedData = JSON.parse(e.target.result);
                if (Array.isArray(importedData) && importedData.every(item => item.category && Array.isArray(item.link))) {
                    saveLinks(importedData);
                    alert('リンクを正常にインポートしました！');
                } else {
                    throw new Error('無効なJSON形式です。');
                }
            } catch (error) {
                console.error("インポートエラー:", error);
                alert(`ファイルの読み込みに失敗しました: ${error.message}`);
            }
        };
        reader.readAsText(file);
    });

    // 初期表示
    const initialLinks = getLinks();
    renderLinks(initialLinks);
});