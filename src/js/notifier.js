// notification.js
class NotificationSystem {
    constructor() {
        this.defaultDuration = 3000; // 3 seconds
        this.initializeContainer();
    }

    initializeContainer() {
        // Create container for notifications if it doesn't exist
        if (!$('#notification-container').length) {
            $('body').append(`
                <div id="notification-container" style="
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    z-index: 9999;
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                "></div>
            `);
        }
    }

    show(message, type = 'info', duration = this.defaultDuration) {
        // Generate unique ID for this notification
        const id = 'notification-' + Date.now();

        // Create notification element
        const notification = $(`
            <div id="${id}" class="notification notification-${type}" style="
                padding: 15px 25px;
                margin-bottom: 10px;
                border-radius: 4px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                display: flex;
                align-items: center;
                justify-content: space-between;
                min-width: 300px;
                max-width: 500px;
                opacity: 0;
                transform: translateX(100%);
                transition: all 0.3s ease-in-out;
                background-color: ${this.getBackgroundColor(type)};
                color: ${this.getTextColor(type)};
            ">
                <div class="notification-content">
                    ${message}
                </div>
                <button class="notification-close" style="
                    background: none;
                    border: none;
                    color: inherit;
                    cursor: pointer;
                    margin-left: 10px;
                    padding: 0 5px;
                    font-size: 18px;
                    opacity: 0.7;
                ">×</button>
            </div>
        `);

        // Add to container
        $('#notification-container').append(notification);

        // Trigger animation
        setTimeout(() => {
            notification.css({
                'opacity': '1',
                'transform': 'translateX(0)'
            });
        }, 10);

        // Add click handler for close button
        notification.find('.notification-close').on('click', () => {
            this.hide(id);
        });

        // Auto-hide after duration
        if (duration > 0) {
            setTimeout(() => {
                this.hide(id);
            }, duration);
        }

        // Add hover pause functionality
        notification.hover(
            () => {
                notification.css('animation-play-state', 'paused');
            },
            () => {
                notification.css('animation-play-state', 'running');
            }
        );

        return id;
    }

    hide(id) {
        const notification = $(`#${id}`);
        notification.css({
            'opacity': '0',
            'transform': 'translateX(100%)'
        });

        setTimeout(() => {
            notification.remove();
        }, 300);
    }

    getBackgroundColor(type) {
        switch (type) {
            case 'success':
                return '#4caf50';
            case 'error':
                return '#f44336';
            case 'warning':
                return '#ff9800';
            case 'info':
            default:
                return '#2196f3';
        }
    }

    getTextColor(type) {
        return '#ffffff';
    }
}

// Create global instance
window.notifications = new NotificationSystem();

// Add CSS to document
$('head').append(`
    <style>
        .notification {
            animation: notification-fade 300ms ease-in-out;
        }
        
        @keyframes notification-fade {
            from {
                opacity: 0;
                transform: translateX(100%);
            }
            to {
                opacity: 1;
                transform: translateX(0);
            }
        }

        .notification-close:hover {
            opacity: 1 !important;
        }

        #notification-container {
            pointer-events: none;
        }

        .notification {
            pointer-events: auto;
        }
    </style>
`);
