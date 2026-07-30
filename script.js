const REGION_MAP = {
    "ME":"ME",
    "MENA":"ME",
    "mena":"ME",
    "Mena":"ME",
    "Middle East":"ME",
    "middle east":"ME",
    "IND":"IND",
    "India":"IND",
    "india":"IND",
    "BR":"BR",
    "Brazil":"BR",
    "brazil":"BR",
    "US":"US",
    "USA":"US",
    "United States":"US",
    "America":"US",
    "BD":"BD",
    "Bangladesh":"BD",
    "PK":"PK",
    "Pakistan":"PK",
    "TH":"TH",
    "Thailand":"TH",
    "VN":"VN",
    "Vietnam":"VN",
    "ID":"ID",
    "Indonesia":"ID",
    "SAC":"SAC",
    "South America":"SAC"
};

document.getElementById('search-btn').addEventListener('click', async () => {
    const uidInput = document.getElementById('uid-input');
    const selectedRegionInput = document.getElementById('region-input');
    const resultContainer = document.getElementById('result-container');

    const uid = uidInput.value.trim();
    const selectedRegion = selectedRegionInput.value;

    if (!uid) {
        alert("Please enter a valid UID");
        return;
    }

    const normalizedRegion = REGION_MAP[selectedRegion] || selectedRegion.toUpperCase();

    // Show results container and skeletons
    resultContainer.classList.remove('hidden');
    resultContainer.innerHTML = `
        <div class="skeleton-card"><div class="skeleton-line" style="width: 40%;"></div><div class="skeleton-line" style="width: 80%;"></div><div class="skeleton-line" style="width: 60%;"></div></div>
        <div class="skeleton-card"><div class="skeleton-line" style="width: 40%;"></div><div class="skeleton-line" style="width: 80%;"></div></div>
    `;

    try {
        const url = `https://info-vip-api.vercel.app/info?uid=${uid}&region=${normalizedRegion}`;
        const response = await fetch(url);
        const data = await response.json();

        if (!response.ok || (data.error && data.error === true)) {
            const errorMsg = data.message || "Player not found or invalid response from server.";
            resultContainer.innerHTML = `
                <div class="error-card">
                    <i class="fa-solid fa-triangle-exclamation"></i>
                    <div class="error-title">Request Failed</div>
                    <div class="error-message">${errorMsg}</div>
                </div>
            `;
            return;
        }

        let html = '';

        const renderObjectAsCard = (title, iconClass, obj) => {
            if (!obj || typeof obj !== 'object') return '';
            let itemsHtml = '';
            for (const [key, val] of Object.entries(obj)) {
                let displayVal = val;
                if (typeof val === 'object' && val !== null) {
                    displayVal = JSON.stringify(val);
                }
                itemsHtml += `
                    <div class="data-item">
                        <div class="data-key">${key}</div>
                        <div class="data-val">${displayVal !== undefined && displayVal !== '' ? displayVal : 'N/A'}</div>
                    </div>
                `;
            }
            return `
                <div class="data-card">
                    <h3><i class="${iconClass}"></i> ${title}</h3>
                    <div class="data-grid">${itemsHtml}</div>
                </div>
            `;
        };

        // 1. Activity Information FIRST
        if (data.activity_info || data.activityInfo) {
            html += renderObjectAsCard('Activity Information', 'fa-solid fa-bolt', data.activity_info || data.activityInfo);
        } else {
            const activityKeys = {};
            for (const k of Object.keys(data)) {
                if (k.toLowerCase().includes('activity')) activityKeys[k] = data[k];
            }
            if (Object.keys(activityKeys).length > 0) {
                html += renderObjectAsCard('Activity Information', 'fa-solid fa-bolt', activityKeys);
            }
        }

        // 2. Basic Information
        if (data.basic_info) html += renderObjectAsCard('Basic Information', 'fa-solid fa-info-circle', data.basic_info);
        
        // 3. Profile Information
        if (data.profile_info) html += renderObjectAsCard('Profile Information', 'fa-solid fa-user', data.profile_info);

        // 4. Guild Information
        if (data.clan_basic_info) html += renderObjectAsCard('Guild Information', 'fa-solid fa-users', data.clan_basic_info);

        // 5. Pet Information
        if (data.pet_info) html += renderObjectAsCard('Pet Information', 'fa-solid fa-paw', data.pet_info);

        // 6. Credit Score
        if (data.credit_score_info) html += renderObjectAsCard('Credit Score', 'fa-solid fa-shield-halved', data.credit_score_info);

        // 7. Diamond Information
        if (data.diamond_cost_res) html += renderObjectAsCard('Diamond Information', 'fa-solid fa-gem', data.diamond_cost_res);

        // 8. Social Information
        if (data.social_info) html += renderObjectAsCard('Social Information', 'fa-solid fa-share-nodes', data.social_info);

        // 9. Weapon Skins
        if (data.weapon_skins || data.weaponSkins) {
            html += renderObjectAsCard('Weapon Skins', 'fa-solid fa-gun', data.weapon_skins || data.weaponSkins);
        }

        // 10. Additional Fields
        const renderedKeys = ['activity_info', 'activityInfo', 'basic_info', 'profile_info', 'clan_basic_info', 'pet_info', 'credit_score_info', 'diamond_cost_res', 'social_info', 'weapon_skins', 'weaponSkins'];
        const remainingData = {};
        for (const [k, v] of Object.entries(data)) {
            if (!renderedKeys.includes(k)) {
                remainingData[k] = v;
            }
        }
        if (Object.keys(remainingData).length > 0) {
            html += renderObjectAsCard('Additional / Other Information', 'fa-solid fa-folder-open', remainingData);
        }

        // Raw JSON Section
        html += `
            <div class="data-card">
                <h3><i class="fa-solid fa-code"></i> Raw JSON</h3>
                <pre style="text-align: left; background: rgba(3, 7, 18, 0.6); padding: 14px; border-radius: 12px; font-size: 12px; color: #38bdf8; overflow-x: auto; max-height: 300px;">${JSON.stringify(data, null, 2)}</pre>
            </div>
        `;

        resultContainer.innerHTML = html;

    } catch (err) {
        resultContainer.innerHTML = `
            <div class="error-card">
                <i class="fa-solid fa-circle-exclamation"></i>
                <div class="error-title">Connection Error</div>
                <div class="error-message">${err.message || 'Unable to communicate with the API.'}</div>
            </div>
        `;
    }
});

document.getElementById('refresh-btn').addEventListener('click', () => {
    location.reload();
});