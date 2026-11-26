export type Language = 'vi' | 'en';

export interface TranslationDictionary {
  nav: {
    title: string;
    badge: string;
    subtitle: string;
    aiConsultant: string;
    langSwitch: string;
    themeSwitch: string;
    toggleTheme: string;
  };
  search: {
    placeholder: string;
    noResults: string;
    quickAccess: string;
  };
  layers: {
    panelTitle: string;
    boundary: string;
    demographics: string;
    ecommerce: string;
    pois: string;
    memberPrefix: string;
  };
  filters: {
    buttonLabel: string;
    title: string;
    reset: string;
    minEbi: string;
    maxEbi: string;
    minPopulation: string;
    minIncome: string;
    maxIncome: string;
    categories: string;
    activeNotice: string;
    matchCount: string;
    emptyTitle: string;
    emptyHint: string;
    matchedRegions: string;
  };
  compare: {
    buttonLabel: string;
    title: string;
    slotA: string;
    slotB: string;
    selectPlaceholder: string;
    clickMapHint: string;
    swap: string;
    clear: string;
    exit: string;
    duplicateWarning: string;
    levelMismatchWarning: string;
    leaderBadge: string;
    tieLabel: string;
    topCategories: string;
  };
  ecommerceMetrics: {
    label: string;
    ebiScore: string;
    avgMonthlyIncome: string;
    totalRetailSales: string;
    noData: string;
  };
  siteSelection: {
    buttonLabel: string;
    title: string;
    evaluationTitle: string;
    radiusLabel: string;
    suitabilityScore: string;
    estPopulation: string;
    competitorPois: string;
    demographicFit: string;
    ebiFit: string;
    logisticsFit: string;
    clickPrompt: string;
    close: string;
  };
  drawer: {
    population: string;
    density: string;
    densityUnit: string;
    ebiScore: string;
    onlineGrowth: string;
    avgIncome: string;
    orderVolume: string;
    askAi: string;
    chartsTitle: string;
    channelsTitle: string;
    close: string;
    levelDistrict: string;
    levelProvince: string;
  };
  charts: {
    ageGroups: {
      under18: string;
      age18_24: string;
      age25_34: string;
      age35_50: string;
      above50: string;
    };
    channels: {
      shopee: string;
      tiktok: string;
      lazada: string;
      others: string;
    };
    ageTitle: string;
    channelTitle: string;
    populationShare: string;
  };
  legend: {
    titleEbi: string;
    titleDemographics: string;
    low: string;
    medium: string;
    high: string;
    warehouse: string;
    mall: string;
  };
  aiDialog: {
    title: string;
    subtitle: string;
    currentRegion: string;
    noRegionSelected: string;
    selectPrompt: string;
    systemContextTitle: string;
    population: string;
    ebiScore: string;
    requestAnalysis: string;
    analyzing: string;
    strategicReport: string;
    errorTitle: string;
    errorMessage: string;
    close: string;
  };
  map: {
    loading: string;
  };
}

export const translations: Record<Language, TranslationDictionary> = {
  vi: {
    nav: {
      title: 'Hệ Thống Phân Tích Bản Đồ Số TMĐT',
      badge: 'Bản Đồ Số GIS',
      subtitle: 'Phân tích thị trường thương mại điện tử & hành vi khách hàng trên nền bản đồ số',
      aiConsultant: 'Cố Vấn AI',
      langSwitch: 'Chuyển đổi ngôn ngữ',
      themeSwitch: 'Giao diện Sáng / Tối',
      toggleTheme: 'Chuyển chế độ giao diện',
    },
    search: {
      placeholder: 'Tìm kiếm tỉnh thành, quận huyện...',
      noResults: 'Không tìm thấy địa điểm phù hợp',
      quickAccess: 'Địa điểm truy cập nhanh',
    },
    layers: {
      panelTitle: 'Lớp Dữ Liệu Bản Đồ',
      boundary: 'Ranh giới hành chính',
      demographics: 'Dân số & Nhân khẩu học',
      ecommerce: 'Sức mua & Chỉ số EBI',
      pois: 'Kho bãi & Điểm bán lẻ',
      memberPrefix: 'TV',
    },
    filters: {
      buttonLabel: 'Bộ Lọc Thị Trường',
      title: 'Tiêu Chí Lọc Thị Trường',
      reset: 'Đặt lại bộ lọc',
      minEbi: 'EBI tối thiểu',
      maxEbi: 'EBI tối đa',
      minPopulation: 'Dân số tối thiểu',
      minIncome: 'Thu nhập tối thiểu (triệu/tháng)',
      maxIncome: 'Thu nhập tối đa (triệu/tháng)',
      categories: 'Ngành hàng tiềm năng',
      activeNotice: 'Đang áp dụng bộ lọc',
      matchCount: '{matched} / {total} khu vực phù hợp',
      emptyTitle: 'Không có khu vực nào phù hợp',
      emptyHint: 'Hãy nới lỏng ngưỡng EBI, thu nhập hoặc chọn thêm ngành hàng.',
      matchedRegions: 'Khu vực phù hợp',
    },
    compare: {
      buttonLabel: 'So Sánh',
      title: 'So Sánh Hai Khu Vực',
      slotA: 'Khu vực A',
      slotB: 'Khu vực B',
      selectPlaceholder: 'Chọn khu vực...',
      clickMapHint: 'Nhấp trực tiếp trên bản đồ hoặc chọn từ danh sách',
      swap: 'Đổi A ↔ B',
      clear: 'Xóa',
      exit: 'Thoát so sánh',
      duplicateWarning: 'Vui lòng chọn hai khu vực khác nhau để so sánh.',
      levelMismatchWarning: 'Lưu ý: Hai khu vực khác cấp hành chính — số liệu có thể chênh lệch theo quy mô.',
      leaderBadge: 'Dẫn đầu',
      tieLabel: 'Ngang bằng',
      topCategories: 'Ngành hàng tiềm năng',
    },
    ecommerceMetrics: {
      label: 'Chỉ số hiển thị',
      ebiScore: 'Chỉ số TMĐT (EBI)',
      avgMonthlyIncome: 'Thu nhập TB/người/tháng',
      totalRetailSales: 'Tổng mức bán lẻ HH & DV',
      noData: 'Chưa có dữ liệu',
    },
    siteSelection: {
      buttonLabel: 'Đánh Giá Vị Trí Vùng Đệm',
      title: 'Công Cụ Đánh Giá Vị Trí',
      evaluationTitle: 'Đánh giá vị trí (Bán kính {radius}km)',
      radiusLabel: 'Bán kính phân tích vùng đệm',
      suitabilityScore: 'Điểm số phù hợp:',
      estPopulation: 'Dân số ước tính:',
      competitorPois: 'Điểm kho/cửa hàng:',
      demographicFit: 'Độ phù hợp nhân khẩu:',
      ebiFit: 'Sức mua thị trường (EBI):',
      logisticsFit: 'Thuận lợi giao vận:',
      clickPrompt: 'Nhấp chuột vào một vị trí trên bản đồ để đánh giá điểm đặt mới.',
      close: 'Đóng',
    },
    drawer: {
      population: 'Dân số',
      density: 'Mật độ',
      densityUnit: 'người/km²',
      ebiScore: 'Điểm số EBI',
      onlineGrowth: 'Tăng trưởng online',
      avgIncome: 'Thu nhập bình quân',
      orderVolume: 'Sản lượng đơn hàng',
      askAi: 'Hỏi AI Cố Vấn về khu vực này',
      chartsTitle: 'Cơ cấu Độ tuổi & Nhân khẩu',
      channelsTitle: 'Tỷ trọng Kênh mua sắm trực tuyến',
      close: 'Đóng chi tiết',
      levelDistrict: 'Quận / Huyện',
      levelProvince: 'Tỉnh / Thành phố',
    },
    charts: {
      ageGroups: {
        under18: 'Dưới 18',
        age18_24: '18 - 24',
        age25_34: '25 - 34',
        age35_50: '35 - 50',
        above50: 'Trên 50',
      },
      channels: {
        shopee: 'Shopee',
        tiktok: 'TikTok Shop',
        lazada: 'Lazada',
        others: 'Kênh khác',
      },
      ageTitle: 'Phân bổ độ tuổi khách hàng',
      channelTitle: 'Thị phần sàn TMĐT',
      populationShare: 'Tỷ lệ (%)',
    },
    legend: {
      titleEbi: 'Chỉ số Sức Mua & EBI',
      titleDemographics: 'Mật độ Dân cư (người/km²)',
      low: 'Thấp',
      medium: 'Trung bình',
      high: 'Cao / Rất cao',
      warehouse: 'Kho / Bưu cục',
      mall: 'TTTM / Siêu thị',
    },
    aiDialog: {
      title: 'Cố Vấn Chiến Lược AI TMĐT',
      subtitle: 'Tích hợp mô hình AI phân tích không gian & khuyến nghị kinh doanh',
      currentRegion: 'Khu vực đang chọn',
      noRegionSelected: 'Chưa chọn khu vực cụ thể trên bản đồ (sẽ phân tích tổng quan cả nước)',
      selectPrompt: '💡 Mẹo: Nhấp vào một tỉnh/thành trên bản đồ trước để nhận chiến lược cụ thể cho địa phương đó.',
      systemContextTitle: 'Dữ liệu không gian khu vực',
      population: 'Quy mô dân số',
      ebiScore: 'Điểm số EBI',
      requestAnalysis: 'Tạo Báo Cáo Phân Tích Chiến Lược',
      analyzing: 'Đang xử lý dữ liệu và tạo khuyến nghị...',
      strategicReport: 'Báo Cáo Khuyến Nghị Chiến Lược',
      errorTitle: 'Lỗi kết nối',
      errorMessage: 'Đã có lỗi xảy ra khi kết nối tới dịch vụ AI.',
      close: 'Đóng',
    },
    map: {
      loading: 'Đang khởi tạo bản đồ số MapLibre GL...',
    },
  },
  en: {
    nav: {
      title: 'Vietnam E-Commerce Market Intelligence',
      badge: 'Digital Maps GIS',
      subtitle: 'Spatial e-commerce market & consumer analytics powered by digital maps',
      aiConsultant: 'AI Consultant',
      langSwitch: 'Switch language',
      themeSwitch: 'Light / Dark mode',
      toggleTheme: 'Toggle theme mode',
    },
    search: {
      placeholder: 'Search provinces, districts...',
      noResults: 'No matching location found',
      quickAccess: 'Quick Access Locations',
    },
    layers: {
      panelTitle: 'Map Data Layers',
      boundary: 'Administrative Boundaries',
      demographics: 'Demographics & Population',
      ecommerce: 'Purchasing Power & EBI Score',
      pois: 'Warehouses & Retail POIs',
      memberPrefix: 'M',
    },
    filters: {
      buttonLabel: 'Market Filters',
      title: 'Market Filter Criteria',
      reset: 'Reset Filters',
      minEbi: 'Min EBI Score',
      maxEbi: 'Max EBI Score',
      minPopulation: 'Minimum Population',
      minIncome: 'Min Monthly Income (M VND)',
      maxIncome: 'Max Monthly Income (M VND)',
      categories: 'Potential Product Categories',
      activeNotice: 'Filters are active',
      matchCount: '{matched} / {total} regions match',
      emptyTitle: 'No matching regions found',
      emptyHint: 'Try relaxing your EBI, income, or category filter criteria.',
      matchedRegions: 'Matched Regions',
    },
    compare: {
      buttonLabel: 'Compare',
      title: 'Two-Region Comparison',
      slotA: 'Region A',
      slotB: 'Region B',
      selectPlaceholder: 'Select a region...',
      clickMapHint: 'Click a region on the map or pick from the selector',
      swap: 'Swap A ↔ B',
      clear: 'Clear',
      exit: 'Exit Compare',
      duplicateWarning: 'Please select two distinct regions to compare.',
      levelMismatchWarning: 'Note: Selected regions are at different administrative levels — scale may differ.',
      leaderBadge: 'Leads',
      tieLabel: 'Tie',
      topCategories: 'Top Online Categories',
    },
    ecommerceMetrics: {
      label: 'Active Metric',
      ebiScore: 'E-Commerce Index (EBI)',
      avgMonthlyIncome: 'Avg. Monthly Income',
      totalRetailSales: 'Total Retail Sales',
      noData: 'No data',
    },
    siteSelection: {
      buttonLabel: 'Site Selection Tool',
      title: 'Site Selection & Buffer Tool',
      evaluationTitle: 'Site Evaluation (Radius = {radius}km)',
      radiusLabel: 'Analysis Buffer Radius',
      suitabilityScore: 'Suitability Score:',
      estPopulation: 'Est. Population:',
      competitorPois: 'Nearby Warehouses/Hubs:',
      demographicFit: 'Demographic Fit:',
      ebiFit: 'Purchasing Power (EBI):',
      logisticsFit: 'Logistics Access:',
      clickPrompt: 'Click anywhere on the map to evaluate another site location.',
      close: 'Close',
    },
    drawer: {
      population: 'Population',
      density: 'Density',
      densityUnit: 'people/km²',
      ebiScore: 'EBI Score',
      onlineGrowth: 'Online Growth',
      avgIncome: 'Avg. Income',
      orderVolume: 'Order Volume',
      askAi: 'Ask AI Consultant about this region',
      chartsTitle: 'Demographics & Age Distribution',
      channelsTitle: 'E-Commerce Platform Breakdown',
      close: 'Close details',
      levelDistrict: 'District',
      levelProvince: 'Province / City',
    },
    charts: {
      ageGroups: {
        under18: 'Under 18',
        age18_24: '18 - 24',
        age25_34: '25 - 34',
        age35_50: '35 - 50',
        above50: 'Over 50',
      },
      channels: {
        shopee: 'Shopee',
        tiktok: 'TikTok Shop',
        lazada: 'Lazada',
        others: 'Others',
      },
      ageTitle: 'Customer Age Distribution',
      channelTitle: 'E-Commerce Channel Share',
      populationShare: 'Share (%)',
    },
    legend: {
      titleEbi: 'Purchasing Power & EBI Index',
      titleDemographics: 'Population Density (people/km²)',
      low: 'Low',
      medium: 'Medium',
      high: 'High / Very High',
      warehouse: 'Hub / Post Office',
      mall: 'Mall / Supermarket',
    },
    aiDialog: {
      title: 'AI Strategic E-Commerce Consultant',
      subtitle: 'Integrated AI spatial analysis & business recommendation engine',
      currentRegion: 'Selected Target Region',
      noRegionSelected: 'No specific region selected (broad national strategy)',
      selectPrompt: '💡 Tip: Click any province/city on the map first to get customized regional insights.',
      systemContextTitle: 'Spatial Region Metrics',
      population: 'Population Size',
      ebiScore: 'EBI Score',
      requestAnalysis: 'Generate Strategic Insights Report',
      analyzing: 'Processing spatial data and synthesizing advice...',
      strategicReport: 'Strategic Advice & Insights Report',
      errorTitle: 'Connection Error',
      errorMessage: 'An error occurred while contacting AI service.',
      close: 'Close',
    },
    map: {
      loading: 'Initializing MapLibre GL Digital Map...',
    },
  },
};
