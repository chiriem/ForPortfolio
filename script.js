/**
 * Jang Seokwon Portfolio
 * script.js
 *
 * 역할
 * 1. 고정 헤더 스크롤 상태 처리
 * 2. 모바일 내비게이션 열기/닫기
 * 3. 현재 보고 있는 섹션에 메뉴 활성 상태 표시
 * 4. Tech Stack 탭 전환
 * 5. 스크롤 reveal 애니메이션
 * 6. 프로젝트 상세 모달 데이터 주입 및 열기/닫기
 * 7. 키보드 접근성 및 포커스 관리
 * 8. Footer 현재 연도 자동 갱신
 */

"use strict";

document.addEventListener("DOMContentLoaded", () => {
    /**
     * 기능 하나에서 오류가 발생하더라도
     * 나머지 기능이 계속 초기화되도록 분리 실행합니다.
     */
    const initialize = (featureName, callback) => {
        try {
            callback();
        } catch (error) {
            console.error(`[Portfolio] ${featureName} 초기화 실패`, error);
        }
    };

    initialize("현재 연도", initializeCurrentYear);
    initialize("헤더 상태", initializeHeader);
    initialize("모바일 메뉴", initializeMobileNavigation);
    initialize("현재 메뉴 표시", initializeActiveNavigation);
    initialize("스킬 탭", initializeSkillTabs);
    initialize("스크롤 애니메이션", initializeRevealAnimation);
    initialize("프로젝트 모달", initializeProjectModal);
});

/* =========================================================
   1. FOOTER CURRENT YEAR
========================================================= */

/**
 * Footer 연도를 현재 연도로 자동 변경합니다.
 */
function initializeCurrentYear() {
    const yearElement = document.getElementById("current-year");

    if (!yearElement) {
        return;
    }

    yearElement.textContent = String(new Date().getFullYear());
}

/* =========================================================
   2. HEADER SCROLL STATE
========================================================= */

/**
 * 페이지가 조금이라도 스크롤되면 헤더에 is-scrolled를 추가합니다.
 * CSS에서 배경 농도와 하단 테두리, 그림자가 변경됩니다.
 */
function initializeHeader() {
    const header = document.getElementById("site-header");

    if (!header) {
        return;
    }

    const updateHeaderState = () => {
        header.classList.toggle("is-scrolled", window.scrollY > 12);
    };

    updateHeaderState();

    window.addEventListener("scroll", updateHeaderState, {
        passive: true,
    });
}

/* =========================================================
   3. MOBILE NAVIGATION
========================================================= */

/**
 * 모바일 환경의 햄버거 메뉴를 제어합니다.
 */
function initializeMobileNavigation() {
    const toggleButton = document.querySelector(".nav-toggle");
    const navigation = document.getElementById("primary-navigation");

    if (!toggleButton || !navigation) {
        return;
    }

    const navigationLinks = Array.from(
        navigation.querySelectorAll('a[href^="#"]')
    );

    const setNavigationState = (isOpen) => {
        navigation.classList.toggle("is-open", isOpen);
        toggleButton.setAttribute("aria-expanded", String(isOpen));
        toggleButton.setAttribute(
            "aria-label",
            isOpen ? "메뉴 닫기" : "메뉴 열기"
        );
    };

    const closeNavigation = () => {
        setNavigationState(false);
    };

    toggleButton.addEventListener("click", () => {
        const isCurrentlyOpen =
            toggleButton.getAttribute("aria-expanded") === "true";

        setNavigationState(!isCurrentlyOpen);
    });

    navigationLinks.forEach((link) => {
        link.addEventListener("click", closeNavigation);
    });

    document.addEventListener("click", (event) => {
        const target = event.target;

        if (!(target instanceof Node)) {
            return;
        }

        const clickedInsideNavigation = navigation.contains(target);
        const clickedToggleButton = toggleButton.contains(target);

        if (!clickedInsideNavigation && !clickedToggleButton) {
            closeNavigation();
        }
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            closeNavigation();
            toggleButton.focus();
        }
    });

    /**
     * 데스크톱 너비로 돌아왔을 때
     * 모바일 메뉴의 열린 상태를 초기화합니다.
     */
    const desktopMediaQuery = window.matchMedia("(min-width: 861px)");

    const handleDesktopChange = (event) => {
        if (event.matches) {
            closeNavigation();
        }
    };

    if (typeof desktopMediaQuery.addEventListener === "function") {
        desktopMediaQuery.addEventListener("change", handleDesktopChange);
    } else {
        desktopMediaQuery.addListener(handleDesktopChange);
    }
}

/* =========================================================
   4. ACTIVE NAVIGATION
========================================================= */

/**
 * 사용자가 현재 보고 있는 섹션에 대응하는 메뉴 링크에
 * is-active 클래스를 부여합니다.
 */
function initializeActiveNavigation() {
    const navigationLinks = Array.from(
        document.querySelectorAll('.primary-nav a[href^="#"]')
    );

    if (navigationLinks.length === 0) {
        return;
    }

    const sectionEntries = navigationLinks
        .map((link) => {
            const sectionId = link.getAttribute("href");

            if (!sectionId) {
                return null;
            }

            const section = document.querySelector(sectionId);

            if (!(section instanceof HTMLElement)) {
                return null;
            }

            return {
                link,
                section,
            };
        })
        .filter(Boolean);

    if (sectionEntries.length === 0) {
        return;
    }

    const setActiveLink = (activeSectionId) => {
        sectionEntries.forEach(({ link, section }) => {
            const isActive = section.id === activeSectionId;

            link.classList.toggle("is-active", isActive);

            if (isActive) {
                link.setAttribute("aria-current", "page");
            } else {
                link.removeAttribute("aria-current");
            }
        });
    };

    if (!("IntersectionObserver" in window)) {
        setActiveLink(sectionEntries[0].section.id);
        return;
    }

    const visibleSections = new Map();

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                visibleSections.set(entry.target.id, entry.intersectionRatio);
            });

            const mostVisibleSection = Array.from(visibleSections.entries())
                .filter(([, ratio]) => ratio > 0)
                .sort((a, b) => b[1] - a[1])[0];

            if (mostVisibleSection) {
                setActiveLink(mostVisibleSection[0]);
            }
        },
        {
            root: null,
            rootMargin: "-25% 0px -55% 0px",
            threshold: [0, 0.1, 0.25, 0.5, 0.75],
        }
    );

    sectionEntries.forEach(({ section }) => {
        observer.observe(section);
    });
}

/* =========================================================
   5. SKILL TABS
========================================================= */

/**
 * Web & Backend / Data & AI / Infra & Database 탭을 전환합니다.
 * 마우스뿐 아니라 방향키, Home, End 키도 지원합니다.
 */
function initializeSkillTabs() {
    const tabList = document.querySelector('[role="tablist"]');

    if (!tabList) {
        return;
    }

    const tabs = Array.from(
        tabList.querySelectorAll('[role="tab"][data-tab-target]')
    );

    if (tabs.length === 0) {
        return;
    }

    const activateTab = (selectedTab, shouldFocus = false) => {
        const targetPanelId = selectedTab.dataset.tabTarget;
        const targetPanel = targetPanelId
            ? document.getElementById(targetPanelId)
            : null;

        if (!targetPanel) {
            console.warn(
                `[Portfolio] 탭 패널을 찾을 수 없습니다: ${targetPanelId}`
            );
            return;
        }

        tabs.forEach((tab) => {
            const panelId = tab.dataset.tabTarget;
            const panel = panelId
                ? document.getElementById(panelId)
                : null;
            const isSelected = tab === selectedTab;

            tab.classList.toggle("is-active", isSelected);
            tab.setAttribute("aria-selected", String(isSelected));
            tab.setAttribute("tabindex", isSelected ? "0" : "-1");

            if (panel) {
                panel.classList.toggle("is-active", isSelected);
                panel.hidden = !isSelected;
            }
        });

        if (shouldFocus) {
            selectedTab.focus();
        }
    };

    tabs.forEach((tab) => {
        tab.addEventListener("click", () => {
            activateTab(tab);
        });

        tab.addEventListener("keydown", (event) => {
            const currentIndex = tabs.indexOf(tab);
            let nextIndex = currentIndex;

            switch (event.key) {
                case "ArrowRight":
                case "ArrowDown":
                    nextIndex = (currentIndex + 1) % tabs.length;
                    break;

                case "ArrowLeft":
                case "ArrowUp":
                    nextIndex =
                        (currentIndex - 1 + tabs.length) % tabs.length;
                    break;

                case "Home":
                    nextIndex = 0;
                    break;

                case "End":
                    nextIndex = tabs.length - 1;
                    break;

                default:
                    return;
            }

            event.preventDefault();
            activateTab(tabs[nextIndex], true);
        });
    });

    const initiallySelectedTab =
        tabs.find((tab) => tab.getAttribute("aria-selected") === "true") ||
        tabs[0];

    activateTab(initiallySelectedTab);
}

/* =========================================================
   6. REVEAL ANIMATION
========================================================= */

/**
 * JavaScript가 정상적으로 초기화됐을 때만
 * body에 animations-ready 클래스를 추가합니다.
 *
 * JavaScript 파일이 없거나 오류가 발생하면
 * CSS 기본값에 의해 콘텐츠는 계속 표시됩니다.
 */
function initializeRevealAnimation() {
    const revealElements = Array.from(document.querySelectorAll(".reveal"));

    if (revealElements.length === 0) {
        return;
    }

    const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion || !("IntersectionObserver" in window)) {
        revealElements.forEach((element) => {
            element.classList.add("is-visible");
        });

        return;
    }

    /**
     * 첫 화면 안에 있는 요소를 먼저 표시 상태로 만듭니다.
     * 그 다음 animations-ready를 추가하므로 화면 깜빡임을 줄입니다.
     */
    const initialViewportLimit = window.innerHeight * 0.95;

    revealElements.forEach((element) => {
        const rect = element.getBoundingClientRect();

        if (rect.top < initialViewportLimit && rect.bottom > 0) {
            element.classList.add("is-visible");
        }
    });

    document.body.classList.add("animations-ready");

    const observer = new IntersectionObserver(
        (entries, revealObserver) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) {
                    return;
                }

                entry.target.classList.add("is-visible");
                revealObserver.unobserve(entry.target);
            });
        },
        {
            root: null,
            rootMargin: "0px 0px -8% 0px",
            threshold: 0.12,
        }
    );

    revealElements.forEach((element) => {
        if (!element.classList.contains("is-visible")) {
            observer.observe(element);
        }
    });
}

/* =========================================================
   7. PROJECT MODAL DATA
========================================================= */

/**
 * 프로젝트 상세 내용입니다.
 *
 * 영상 연결 방법:
 * video 값을 null 대신 실제 경로로 변경합니다.
 *
 * 예:
 * video: "./assets/videos/autodrive.mp4"
 */
const PROJECT_DATA = {
    autodrive: {
        category: "AI · DATA",
        title: "자율주행 주행 로그 분석 LLM 시스템",
        summary:
            "라즈베리파이 기반 자율주행 로그를 분석하고, 실패 원인과 개선 방향을 제공하는 LLM 기반 분석 시스템입니다.",
        period: "2025.12 — 2026.01",
        type: "Team Project",
        roleShort: "LLM · Log Analysis · Git",
        overview:
            "카메라 기반 자율주행 과정에서 생성된 로그를 수집하고 분석하여, 주행 실패 프레임의 원인을 확인할 수 있도록 구성한 프로젝트입니다. 분석 결과는 Streamlit 대시보드에서 시각적으로 확인할 수 있도록 구현했습니다.",
        problem:
            "초기 로그는 형식이 일정하지 않았고 단순 수치 출력 중심이라 실패 원인을 판단하기 어려웠습니다. 분석 기준도 명확하지 않아 동일한 로그에 대한 해석이 달라질 수 있었습니다.",
        solution:
            "로그 데이터 구조를 정리하고 실패 조건을 재정의했습니다. 이후 Pandas 기반 전처리와 시각화를 적용하고, OpenAI API를 연동해 실패 원인과 개선 방향을 생성하는 분석 흐름을 구성했습니다.",
        result:
            "팀원이 로그 전체를 직접 확인하지 않아도 주요 실패 구간과 원인을 빠르게 검토할 수 있는 분석 화면을 구현했습니다. 이 과정에서 데이터 기준 정의와 전처리가 LLM 응답 품질보다 먼저 해결되어야 한다는 점을 배웠습니다.",
        roles: [
            "주행 로그 추출 및 CSV 데이터 구조 정리",
            "실패 조건과 분석 기준 재정의",
            "OpenAI API 기반 로그 원인 분석 기능 개발",
            "Streamlit 기반 분석 대시보드 및 시각화 구현",
            "Git 버전 관리와 변경 이력 정리",
        ],
        tech: [
            "Python",
            "Pandas",
            "NumPy",
            "Streamlit",
            "OpenAI API",
            "OpenCV",
            "Raspberry Pi",
            "Git",
        ],
        video: null,
        links: [
            {
                label: "Project Notion",
                url: "https://ruddy-workshop-589.notion.site/2e6407d6bd7e8172a7d4f181f4e03a2f",
            },
            {
                label: "GitHub",
                url: "https://github.com/chiriem",
            },
        ],
    },

    "word-learning": {
        category: "BACKEND · WEB",
        title: "빅데이터 분석 영단어 학습 프로그램",
        summary:
            "Spring Boot와 MyBatis를 기반으로 사용자와 학습 데이터를 관리하는 팀 웹 프로젝트입니다.",
        period: "Team Project",
        type: "Backend Web Service",
        roleShort: "Backend · Database",
        overview:
            "영단어 학습 데이터를 웹에서 조회하고 관리할 수 있도록 구현한 팀 프로젝트입니다. Spring Boot 기반 서버 구조와 MyBatis를 활용한 데이터베이스 연동을 중심으로 개발했습니다.",
        problem:
            "사용자 정보와 학습 데이터를 안정적으로 저장하고 화면 기능과 연결할 수 있는 백엔드 구조가 필요했습니다. 팀 단위 개발이므로 기능과 데이터 흐름을 명확하게 나누는 것도 중요했습니다.",
        solution:
            "MVC 구조를 기준으로 기능을 분리하고, MyBatis 매퍼를 사용해 데이터 조회와 저장 로직을 구성했습니다. 데이터베이스 테이블과 화면 기능 사이의 흐름을 정리해 팀원들이 기능을 연결할 수 있도록 했습니다.",
        result:
            "Spring Boot 프로젝트 구조와 MyBatis 기반 데이터 접근 방식을 실제 팀 프로젝트에서 적용했습니다. 화면 기능만 구현하는 것이 아니라 데이터 구조와 백엔드 흐름을 함께 설계하는 경험을 쌓았습니다.",
        roles: [
            "Spring Boot 기반 백엔드 기능 구현",
            "MyBatis 매퍼와 SQL 작성",
            "사용자 및 학습 데이터 DB 연동",
            "팀 프로젝트 기능 연계 및 수정 대응",
        ],
        tech: [
            "Java",
            "Spring Boot",
            "Spring MVC",
            "MyBatis",
            "JSP",
            "MySQL",
        ],
        video: null,
        links: [],
    },

    "video-hub": {
        category: "PERSONAL · WEB",
        title: "웹 영상 통합 시청 서비스",
        summary:
            "여러 웹 영상 URL을 하나의 화면에서 확인할 수 있도록 구성한 개인 웹 프로젝트입니다.",
        period: "Personal Project",
        type: "Web Application",
        roleShort: "Planning · Web Development",
        overview:
            "여러 플랫폼의 영상 링크를 각각 이동해 확인해야 하는 불편을 줄이기 위해, 영상 URL을 한 화면에 모아볼 수 있도록 구성한 개인 프로젝트입니다.",
        problem:
            "서로 다른 사이트의 영상을 확인하려면 여러 탭과 페이지를 반복적으로 이동해야 했습니다. 영상 영역이 많아질수록 화면 구성과 사용 흐름도 복잡해지는 문제가 있었습니다.",
        solution:
            "영상 입력과 재생 영역을 하나의 화면 흐름으로 구성하고, Spring Framework와 JavaScript를 활용해 사용자가 여러 영상을 효율적으로 확인할 수 있는 레이아웃을 설계했습니다.",
        result:
            "개인 아이디어를 웹 서비스 구조로 구체화하고 화면과 서버 기능을 직접 연결했습니다. 사용자 입장에서 필요한 기능과 화면 배치를 먼저 생각하는 경험을 얻었습니다.",
        roles: [
            "서비스 아이디어 및 화면 구조 기획",
            "Spring Framework 기반 웹 기능 구현",
            "JavaScript를 활용한 화면 인터랙션 구성",
            "영상 재생 영역과 레이아웃 설계",
        ],
        tech: [
            "Java",
            "Spring Framework",
            "JavaScript",
            "HTML",
            "CSS",
        ],
        video: null,
        links: [],
    },
};

/* =========================================================
   8. PROJECT MODAL
========================================================= */

/**
 * 프로젝트 카드 클릭 시 PROJECT_DATA 내용을 모달에 채웁니다.
 * ESC, 배경 클릭, 닫기 버튼을 지원합니다.
 * 모달이 열릴 때 포커스를 내부에 유지합니다.
 */
function initializeProjectModal() {
    const modal = document.getElementById("project-modal");
    const projectButtons = Array.from(
        document.querySelectorAll("[data-project-id]")
    );

    if (!modal || projectButtons.length === 0) {
        return;
    }

    const modalPanel = modal.querySelector(".project-modal-panel");
    const closeButtons = Array.from(
        modal.querySelectorAll("[data-modal-close]")
    );

    const elements = {
        category: document.getElementById("modal-project-category"),
        title: document.getElementById("modal-project-title"),
        summary: document.getElementById("modal-project-summary"),
        period: document.getElementById("modal-project-period"),
        type: document.getElementById("modal-project-type"),
        roleShort: document.getElementById("modal-project-role-short"),
        overview: document.getElementById("modal-project-overview"),
        problem: document.getElementById("modal-project-problem"),
        solution: document.getElementById("modal-project-solution"),
        result: document.getElementById("modal-project-result"),
        roles: document.getElementById("modal-project-roles"),
        tech: document.getElementById("modal-project-tech"),
        links: document.getElementById("modal-project-links"),
        video: document.getElementById("modal-project-video"),
        placeholder: document.getElementById("modal-media-placeholder"),
    };

    let previouslyFocusedElement = null;

    const setText = (element, value) => {
        if (element) {
            element.textContent = value || "-";
        }
    };

    const replaceListItems = (container, items) => {
        if (!container) {
            return;
        }

        container.replaceChildren();

        items.forEach((item) => {
            const listItem = document.createElement("li");
            listItem.textContent = item;
            container.appendChild(listItem);
        });
    };

    const renderLinks = (links) => {
        if (!elements.links) {
            return;
        }

        elements.links.replaceChildren();

        links.forEach((linkData) => {
            if (!isSafeExternalUrl(linkData.url)) {
                console.warn(
                    `[Portfolio] 안전하지 않은 프로젝트 URL을 제외했습니다: ${linkData.url}`
                );
                return;
            }

            const link = document.createElement("a");
            link.className = "modal-action-link";
            link.href = linkData.url;
            link.target = "_blank";
            link.rel = "noopener noreferrer";
            link.textContent = linkData.label;

            elements.links.appendChild(link);
        });

        elements.links.hidden = elements.links.childElementCount === 0;
    };

    const renderVideo = (videoPath) => {
        if (!elements.video || !elements.placeholder) {
            return;
        }

        elements.video.pause();
        elements.video.removeAttribute("src");
        elements.video.load();
        elements.video.hidden = true;
        elements.placeholder.hidden = false;

        if (!videoPath) {
            return;
        }

        elements.video.src = videoPath;
        elements.video.hidden = false;
        elements.placeholder.hidden = true;

        const playPromise = elements.video.play();

        if (playPromise && typeof playPromise.catch === "function") {
            playPromise.catch(() => {
                /**
                 * 브라우저 자동 재생 정책으로 재생이 거부되면
                 * 영상 자체는 표시하고 사용자가 직접 재생할 수 있게 합니다.
                 */
                elements.video.controls = true;
            });
        }
    };

    const renderProject = (project) => {
        setText(elements.category, project.category);
        setText(elements.title, project.title);
        setText(elements.summary, project.summary);
        setText(elements.period, project.period);
        setText(elements.type, project.type);
        setText(elements.roleShort, project.roleShort);
        setText(elements.overview, project.overview);
        setText(elements.problem, project.problem);
        setText(elements.solution, project.solution);
        setText(elements.result, project.result);

        replaceListItems(elements.roles, project.roles);
        replaceListItems(elements.tech, project.tech);
        renderLinks(project.links);
        renderVideo(project.video);
    };

    const getFocusableElements = () => {
        if (!modalPanel) {
            return [];
        }

        return Array.from(
            modalPanel.querySelectorAll(
                [
                    'a[href]:not([tabindex="-1"])',
                    'button:not([disabled]):not([tabindex="-1"])',
                    'video[controls]:not([tabindex="-1"])',
                    '[tabindex]:not([tabindex="-1"])',
                ].join(",")
            )
        ).filter((element) => {
            return (
                element instanceof HTMLElement &&
                !element.hidden &&
                element.offsetParent !== null
            );
        });
    };

    const openModal = (projectId, triggerButton) => {
        const project = PROJECT_DATA[projectId];

        if (!project) {
            console.warn(
                `[Portfolio] 프로젝트 데이터를 찾을 수 없습니다: ${projectId}`
            );
            return;
        }

        previouslyFocusedElement =
            triggerButton instanceof HTMLElement
                ? triggerButton
                : document.activeElement;

        renderProject(project);

        modal.classList.add("is-open");
        modal.setAttribute("aria-hidden", "false");
        document.body.classList.add("modal-open");

        /**
         * CSS 전환 후 닫기 버튼으로 포커스를 이동합니다.
         */
        window.requestAnimationFrame(() => {
            const closeButton = modal.querySelector(".modal-close");

            if (closeButton instanceof HTMLElement) {
                closeButton.focus();
            }
        });
    };

    const closeModal = () => {
        if (!modal.classList.contains("is-open")) {
            return;
        }

        modal.classList.remove("is-open");
        modal.setAttribute("aria-hidden", "true");
        document.body.classList.remove("modal-open");

        if (elements.video) {
            elements.video.pause();
        }

        if (previouslyFocusedElement instanceof HTMLElement) {
            previouslyFocusedElement.focus();
        }

        previouslyFocusedElement = null;
    };

    projectButtons.forEach((button) => {
        button.addEventListener("click", () => {
            const projectId = button.dataset.projectId;

            if (projectId) {
                openModal(projectId, button);
            }
        });
    });

    closeButtons.forEach((button) => {
        button.addEventListener("click", closeModal);
    });

    document.addEventListener("keydown", (event) => {
        if (!modal.classList.contains("is-open")) {
            return;
        }

        if (event.key === "Escape") {
            event.preventDefault();
            closeModal();
            return;
        }

        if (event.key !== "Tab") {
            return;
        }

        const focusableElements = getFocusableElements();

        if (focusableElements.length === 0) {
            event.preventDefault();
            return;
        }

        const firstElement = focusableElements[0];
        const lastElement =
            focusableElements[focusableElements.length - 1];

        if (
            event.shiftKey &&
            document.activeElement === firstElement
        ) {
            event.preventDefault();
            lastElement.focus();
        } else if (
            !event.shiftKey &&
            document.activeElement === lastElement
        ) {
            event.preventDefault();
            firstElement.focus();
        }
    });
}

/* =========================================================
   9. URL SAFETY
========================================================= */

/**
 * 프로젝트 링크는 http 또는 https만 허용합니다.
 */
function isSafeExternalUrl(value) {
    try {
        const url = new URL(value, window.location.href);

        return url.protocol === "http:" || url.protocol === "https:";
    } catch {
        return false;
    }
}
